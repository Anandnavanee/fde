# Apex Institutional Ledger

A TypeScript React demo application based on the Stitch references in this folder. It connects a case queue, document tracker, audit trail, and chase-email composer in one responsive workspace.

## Run in VS Code

1. Open this folder in VS Code.
2. In the integrated terminal, run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

Run `npm run build` to type-check and create the production build in `dist/`.

## Docker and GitHub Actions deployment

The `Dockerfile` builds the Vite app and serves the static SPA with unprivileged Nginx on port 8080. Build locally with `docker build -t apex-institutional-ledger .` and run with `docker run --rm -p 8080:8080 apex-institutional-ledger`.

The `.github/workflows/ci-cd.yml` workflow type-checks, builds, and validates the Docker image on pull requests and pushes to `main`. A successful push to `main` builds and publishes the image to `ghcr.io/anandnavanee/fde`; the Cloud Run job deploys it to `asia-south1` when deployment is explicitly enabled and its WIF configuration is present. The Cloud Run deployment requests public access.

The same workflow publishes the frontend as a static public site on GitHub Pages at `https://anandnavanee.github.io/fde/`. This demo build does not depend on Cloud Run, GCP IAM, or a backend.

Before the first deployment:

1. Configure Workload Identity Federation for GitHub Actions in project `slabspro-slabsuser45`. An administrator can run the following in a shell with `gcloud` access:

   ```sh
   PROJECT_ID=slabspro-slabsuser45
   REPOSITORY=Anandnavanee/fde
   POOL=github-actions
   PROVIDER=github
   SERVICE_ACCOUNT=github-deployer
   PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

   gcloud services enable run.googleapis.com iamcredentials.googleapis.com \
     --project="$PROJECT_ID"
   gcloud iam workload-identity-pools create "$POOL" \
     --project="$PROJECT_ID" --location=global \
     --display-name="GitHub Actions"
   gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
     --project="$PROJECT_ID" --location=global \
     --workload-identity-pool="$POOL" \
     --display-name="GitHub" \
     --issuer-uri="https://token.actions.githubusercontent.com" \
     --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
     --attribute-condition="assertion.repository == '$REPOSITORY'"
   gcloud iam service-accounts create "$SERVICE_ACCOUNT" --project="$PROJECT_ID"
   DEPLOYER="$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"
   gcloud projects add-iam-policy-binding "$PROJECT_ID" \
     --member="serviceAccount:$DEPLOYER" --role="roles/run.admin"
   gcloud projects add-iam-policy-binding "$PROJECT_ID" \
     --member="serviceAccount:$DEPLOYER" --role="roles/iam.serviceAccountUser"
   gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER" \
     --project="$PROJECT_ID" --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPOSITORY"
   ```

   The workflow deploys a public GHCR image, so it does not create or use Artifact Registry. A GCP administrator may need to enable the listed APIs and grant these IAM roles.
2. Add these GitHub repository **variables** under **Settings → Secrets and variables → Actions → Variables**:
   - `GCP_WIF_PROVIDER`: full Workload Identity Provider resource name.
   - `GCP_SERVICE_ACCOUNT`: service account email used by GitHub Actions.
3. Push to `main` once to publish the `fde` package. Set its visibility to **Public** in GitHub Packages; Cloud Run can directly deploy public GHCR images, while private GHCR images require an Artifact Registry remote repository.
4. Once the package is public and the WIF variables are set, add the repository variable `DEPLOY_TO_CLOUD_RUN` with the value `true`. The deployer identity must be allowed to deploy the service and apply its public Invoker policy; the organization must permit unauthenticated Cloud Run access. Push to `main` or run the workflow manually to build, publish, and deploy.

The Cloud Run deployment job remains skipped until `DEPLOY_TO_CLOUD_RUN` is explicitly enabled and both WIF variables exist. This lets CI and GHCR publishing work before GCP identity is configured.

The workflow uses GitHub OIDC / Workload Identity Federation rather than storing a long-lived GCP key in GitHub. Cloud Storage is not used, so its `asia-south1` bucket restriction does not require any additional resources.

## Demo behavior

The app starts on the case queue. Open a case to review its documents, mark a document as received, open the audit trail, or draft a client chase. The chase composer includes a compliance acknowledgment gate. Saving and dispatching are simulated locally; no email is transmitted and no files are uploaded. All records are sample data.

The original Stitch references are retained in the sibling folders:

- `case_queue_institutional_rm_ledger/`
- `case_detail_document_tracker_apex_global/`
- `draft_send_chase_email_apex_global/`
- `institutional_rm_ledger/DESIGN.md`
