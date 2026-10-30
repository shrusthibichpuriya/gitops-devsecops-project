#GitOps DevSecOps Project
A CI/CD pipeline that automatically tests, builds, security-scans, and publishes a containerized Node.js application using GitHub Actions, Docker, and Trivy. The pipeline blocks any image with CRITICAL vulnerabilities from reaching the registry.

Overview

This project demonstrates a DevSecOps workflow where security is built into the pipeline instead of being added at the end ("shift-left security"). Every push to main triggers an automated process that verifies the code, builds a container image, scans it for known vulnerabilities, and only then pushes it to the container registry.

Tech          |       Stack
-------------------------------
Area	        |       Tool
-------------------------------
Application   |     	Node.js
-------------------------------
Containerization  |  Docker (multi-step build with Buildx)
--------------------------------------------------------
CI/CD	            |  GitHub Actions
--------------------------------------------------------
Security scanning |	 Trivy v0.71.0
-------------------------------------
Container registry	| Docker Hub
-------------------------------------
Base image	    |      node:20-alpine


#Pipeline Architecture
 git push (main)
       |
       v
 +-------------+      +-------------------------------------------+
 |    test     | ---> |            build-scan-push                |
 |  (unit      |      |  1. Build Docker image                    |
 |   tests)    |      |  2. Trivy scan (fail on CRITICAL)         |
 +-------------+      |  3. Login to registry + push image        |
                      +-------------------------------------------+
Jobs
test: installs dependencies and runs the application tests.
build-scan-push (runs only if test passes):
Builds the Docker image using Docker Buildx.
Scans the image with Trivy. The build fails if any CRITICAL vulnerability is found.
Logs in to the registry and pushes the image only if the scan passes.
Security Highlights
Vulnerability gate: Trivy runs on every build with severity: CRITICAL and exit-code: 1, so insecure images never get published.
Real issue found and fixed: Trivy detected a CRITICAL vulnerability (CVE-2026-59873, a denial-of-service issue in the tar package, installed version 6.2.1, fixed in 7.5.19). It was bundled with npm inside the base image. I resolved it by updating the Dockerfile, and the pipeline now passes with 0 CRITICAL findings.
Minimal base image: uses Alpine to reduce the attack surface.
Secrets management: registry credentials are stored in GitHub Actions Secrets, never in the code.
Challenges and What I Learned
Debugged Trivy action and version pinning errors (action version vs. Trivy binary version).
Learned that npm@latest can require a newer Node.js than the base image provides (EBADENGINE), and how to read Docker build logs to find the failing layer.
Learned how to interpret a Trivy report (library, installed version, fixed version) and decide between upgrading, patching, or removing a vulnerable component.
Project Structure
.
├── app/                      # Node.js application source and package.json
├── Dockerfile                # Container image definition
├── .github/
│   └── workflows/
│       └── ci-cd.yaml        # CI/CD pipeline definition
└── README.md
Getting Started
Prerequisites
Docker
Node.js 20+ (only if you want to run without Docker)
Git
Run with Docker
bash
git clone https://github.com/shrusthibichpuriya/gitops-devsecops-project.git
cd gitops-devsecops-project

docker build -t gitops-demo-app .
docker run -p 3000:3000 gitops-demo-app

Then open http://localhost:3000 in your browser.

Run without Docker
bash
cd app
npm install
npm start
Scan the image locally with Trivy
bash
trivy image --severity CRITICAL gitops-demo-app
CI/CD Setup (if you fork this repo)

Add these secrets under Settings → Secrets and variables → Actions:

Secret	Description
DOCKERHUB_USERNAME	Your Docker Hub username
DOCKERHUB_TOKEN	A Docker Hub access token

Push to main and the pipeline will run automatically from the Actions tab.

Pipeline Status

The green badge at the top of this README shows the current state of the latest run on main.

Roadmap
 Add Kubernetes manifests
 Deploy using Argo CD (full GitOps flow with automatic sync)
 Scan for HIGH severity and upload results to the GitHub Security tab (SARIF)
 Add Dependabot for automatic dependency updates
 Add image signing with Cosign
Author

Shrusthi Bichpuriya

GitHub: @shrusthibichpuriya
LinkedIn: add your LinkedIn profile link here
Email: add your email here
