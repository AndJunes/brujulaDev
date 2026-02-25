BEGIN;

-- CREAMOS EL ESQUEMA (La carpeta principal)
CREATE SCHEMA IF NOT EXISTS public;

-- TABLAS BASE
CREATE TABLE IF NOT EXISTS public."User" (
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

CREATE TABLE IF NOT EXISTS public."Skill" (
    id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY (id),
    CONSTRAINT "Skill_name_key" UNIQUE (name)
);

-- TABLAS PRINCIPALES NORMALIZADAS (3FN)
CREATE TABLE IF NOT EXISTS public."Job" (
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
    CONSTRAINT "Job_pkey" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."JobSkill" (
    "jobId" text COLLATE pg_catalog."default" NOT NULL,
    "skillId" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId", "skillId")
);

CREATE TABLE IF NOT EXISTS public."Application" (
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

CREATE TABLE IF NOT EXISTS public."Agreement" (
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

CREATE TABLE IF NOT EXISTS public."AgreementFile" (
    id text COLLATE pg_catalog."default" NOT NULL,
    "agreementId" text COLLATE pg_catalog."default" NOT NULL,
    "fileUrl" text COLLATE pg_catalog."default" NOT NULL,
    "fileName" text COLLATE pg_catalog."default",
    "uploadedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgreementFile_pkey" PRIMARY KEY (id)
);

-- LLAVES FORÁNEAS (Relaciones)
ALTER TABLE IF EXISTS public."Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES public."User" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public."JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE IF EXISTS public."JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public."Skill" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE IF EXISTS public."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE IF EXISTS public."Application" ADD CONSTRAINT "Application_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES public."User" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public."Agreement" ADD CONSTRAINT "Agreement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE IF EXISTS public."Agreement" ADD CONSTRAINT "Agreement_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES public."User" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public."AgreementFile" ADD CONSTRAINT "AgreementFile_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES public."Agreement" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE;

COMMIT;