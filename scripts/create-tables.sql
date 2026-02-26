-- LIMPIEZA Y PREPARACIÓN DEL ESQUEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- TABLAS BASE E INDEPENDIENTES
CREATE TABLE public."User" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "stellarAddress" text COLLATE pg_catalog."default" NOT NULL,
    "displayName" text COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default",
    balance double precision DEFAULT 0,
    bio text COLLATE pg_catalog."default",
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" timestamp(3) without time zone NOT NULL,
    metadata jsonb,
    CONSTRAINT "User_pkey" PRIMARY KEY (id),
    CONSTRAINT "User_stellarAddress_key" UNIQUE ("stellarAddress")
);

CREATE TABLE public."Skill" (
    id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY (id),
    CONSTRAINT "Skill_name_key" UNIQUE (name)
);

-- PERFIL DE USUARIO (Relación 1:1)
CREATE TABLE public."Profile" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "userId" text COLLATE pg_catalog."default" NOT NULL,
    "avatarUrl" text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    "hourlyRate" double precision,
    location text COLLATE pg_catalog."default",
    "websiteUrl" text COLLATE pg_catalog."default",
    "socialLinks" jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Profile_pkey" PRIMARY KEY (id),
    CONSTRAINT "Profile_userId_key" UNIQUE ("userId")
);

-- TABLAS TRANSACCIONALES NORMALIZADAS (3FN)
CREATE TABLE public."Job" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "employerId" text COLLATE pg_catalog."default" NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    deliverables text COLLATE pg_catalog."default",
    requirements text COLLATE pg_catalog."default",
    amount double precision NOT NULL,
    "estimatedDays" integer,
    deadline timestamp(3) without time zone,
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'DRAFT'::text,
    "escrowContractId" text COLLATE pg_catalog."default",
    "escrowAddress" text COLLATE pg_catalog."default",
    "engagementId" text COLLATE pg_catalog."default",
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fundedAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    metadata jsonb,
    category text COLLATE pg_catalog."default",
    CONSTRAINT "Job_pkey" PRIMARY KEY (id),
    CONSTRAINT "Job_escrowContractId_key" UNIQUE ("escrowContractId")
);

CREATE TABLE public."JobSkill" (
    "jobId" text COLLATE pg_catalog."default" NOT NULL,
    "skillId" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId", "skillId")
);

CREATE TABLE public."Application" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "jobId" text COLLATE pg_catalog."default" NOT NULL,
    "freelancerId" text COLLATE pg_catalog."default" NOT NULL,
    "coverLetter" text COLLATE pg_catalog."default",
    "portfolioUrl" text COLLATE pg_catalog."default",
    "proposedDeliveryDate" timestamp(3) without time zone,
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'PENDING'::text,
    "appliedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    CONSTRAINT "Application_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."Agreement" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "jobId" text COLLATE pg_catalog."default" NOT NULL,
    "freelancerId" text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVE'::text,
    "deliveryUrl" text COLLATE pg_catalog."default",
    "deliveryNote" text COLLATE pg_catalog."default",
    "employerApproved" boolean NOT NULL DEFAULT false,
    "freelancerConfirmed" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" timestamp(3) without time zone,
    "employerApprovedAt" timestamp(3) without time zone,
    "freelancerConfirmedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "disputedAt" timestamp(3) without time zone,
    CONSTRAINT "Agreement_pkey" PRIMARY KEY (id),
    CONSTRAINT "Agreement_jobId_key" UNIQUE ("jobId")
);

CREATE TABLE public."AgreementFile" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "agreementId" text COLLATE pg_catalog."default" NOT NULL,
    "fileUrl" text COLLATE pg_catalog."default" NOT NULL,
    "fileName" text COLLATE pg_catalog."default",
    "uploadedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgreementFile_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."Transaction" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "agreementId" text COLLATE pg_catalog."default",
    "jobId" text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default" NOT NULL,
    amount double precision NOT NULL,
    "txHash" text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'PENDING'::text,
    "fromAddress" text COLLATE pg_catalog."default",
    "toAddress" text COLLATE pg_catalog."default",
    metadata jsonb,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" timestamp(3) without time zone,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY (id),
    CONSTRAINT "Transaction_txHash_key" UNIQUE ("txHash")
);

CREATE TABLE public."Notification" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "userId" text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    "actionUrl" text COLLATE pg_catalog."default",
    read boolean NOT NULL DEFAULT false,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."NotificationPreferences" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "userId" text COLLATE pg_catalog."default" NOT NULL,
    "contactMethod" text COLLATE pg_catalog."default",
    "contactValue" text COLLATE pg_catalog."default",
    "notifyOnApplication" boolean NOT NULL DEFAULT true,
    "notifyOnDelivery" boolean NOT NULL DEFAULT true,
    "notifyOnPayment" boolean NOT NULL DEFAULT true,
    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY (id),
    CONSTRAINT "NotificationPreferences_userId_key" UNIQUE ("userId")
);

-- RELACIONES (Foreign Keys)
ALTER TABLE public."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public."JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public."JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public."Skill" (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public."Application" ADD CONSTRAINT "Application_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public."Agreement" ADD CONSTRAINT "Agreement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public."Agreement" ADD CONSTRAINT "Agreement_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public."AgreementFile" ADD CONSTRAINT "AgreementFile_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES public."Agreement" (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."Transaction" ADD CONSTRAINT "Transaction_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES public."Agreement" (id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE public."Transaction" ADD CONSTRAINT "Transaction_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE public."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public."NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE RESTRICT;