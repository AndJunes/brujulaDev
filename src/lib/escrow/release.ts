import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

export async function releaseFundsServerSide(agreementId: string): Promise<string> {
  const sql = getDb();
  const client = getTrustlessWorkClient();

  // Get agreement with job data
  const agreements = await sql`
    SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount", j.id as "realJobId"
    FROM "Agreement" a
    JOIN "Job" j ON a."jobId" = j.id
    WHERE a.id = ${agreementId}
  `;

  if (agreements.length === 0) {
    throw new Error("Acuerdo no encontrado");
  }

  const agreement = agreements[0];

  let txHash: string;
  let alreadyReleased = false;

  try {
    // Step 1: Call Trustless Work to get unsigned XDR for release
    const response = await client.releaseFundsSingleRelease({
      contractId: agreement.escrowContractId,
      releaseSigner: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
    });

    if (!response.unsignedTransaction) {
      throw new Error("No se recibio unsignedTransaction para release");
    }

    // Step 2: Sign server-side with Brujula's secret key
    const secretKey = process.env.BRUJULA_STELLAR_SECRET_KEY;
    if (!secretKey) {
      throw new Error("BRUJULA_STELLAR_SECRET_KEY no esta configurada");
    }

    const keypair = Keypair.fromSecret(secretKey);
    const transaction = TransactionBuilder.fromXDR(
      response.unsignedTransaction,
      Networks.TESTNET
    );
    transaction.sign(keypair);
    const signedXdr = transaction.toXDR();

    // Step 3: Send signed transaction to Stellar
    const sendResponse = await client.sendTransaction({ signedXdr });
    txHash = sendResponse.transactionHash || sendResponse.contractId || `tx_${Date.now()}_${generateId(8)}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("funds have been released")) {
      // Already released on-chain from a previous attempt
      alreadyReleased = true;
      txHash = `tx_released_${Date.now()}_${generateId(8)}`;
    } else {
      throw err;
    }
  }

  // Step 4: Record transactions in DB
  const platformFee = Math.round(agreement.jobAmount * 0.02 * 100) / 100;
  const freelancerAmount = agreement.jobAmount;

  // Release transaction
  const releaseTxId = generateId(25);
  await sql`
    INSERT INTO "Transaction" (
      id, "agreementId", "jobId", type, amount, "txHash",
      status, "fromAddress", "toAddress", "createdAt", "confirmedAt"
    ) VALUES (
      ${releaseTxId}, ${agreementId}, ${agreement.realJobId}, 'RELEASE',
      ${freelancerAmount}, ${txHash}, 'CONFIRMED',
      ${agreement.escrowContractId}, ${agreement.freelancerAddress},
      NOW(), NOW()
    )
  `;

  // Platform fee transaction
  const feeTxId = generateId(25);
  await sql`
    INSERT INTO "Transaction" (
      id, "agreementId", "jobId", type, amount, "txHash",
      status, "fromAddress", "toAddress", "createdAt", "confirmedAt"
    ) VALUES (
      ${feeTxId}, ${agreementId}, ${agreement.realJobId}, 'PLATFORM_FEE',
      ${platformFee}, ${`${txHash}_fee`}, 'CONFIRMED',
      ${agreement.escrowContractId}, ${process.env.BRUJULA_STELLAR_PUBLIC_KEY!},
      NOW(), NOW()
    )
  `;

  // Step 5: Update agreement and job
  await sql`
    UPDATE "Agreement"
    SET status = 'COMPLETED', "completedAt" = NOW()
    WHERE id = ${agreementId}
  `;

  await sql`
    UPDATE "Job" SET status = 'COMPLETED', "completedAt" = NOW()
    WHERE id = ${agreement.realJobId}
  `;

  // Step 6: Notify employer
  await createNotification({
    userId: agreement.employerId,
    type: "PAYMENT_RELEASED",
    title: "Pago liberado",
    message: `Los fondos de "${agreement.jobTitle}" ($${freelancerAmount} USDC) fueron liberados al freelancer.`,
    actionUrl: `/dashboard/employer`,
  });

  return txHash;
}
