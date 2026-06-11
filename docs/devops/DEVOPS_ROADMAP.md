# Fuzzie DevOps Mini Course

This project is a Next.js 14 app with Prisma and PostgreSQL. The recommended beginner-friendly production path is Docker + AWS ECS Fargate + RDS PostgreSQL + GitHub Actions + Terraform.

Total beginner study estimate: 140-200 hours over 10-16 weeks. Job-ready junior DevOps confidence usually takes 4-6 months when you repeat these steps on 2-3 projects.

## 1. Project Understanding & Environment Setup

🎯 Goal Run the app locally and understand what every service does.

📚 Concepts to Learn Next.js serves the web app, Prisma talks to PostgreSQL, environment variables hold config, and external services like Clerk, Stripe, Google, Slack, Discord, and Notion need callback URLs.

⏱️ Recommended Study Time 6-8 hours total. Daily plan: 2 hours/day for 3-4 days.

🛠️ Hands-on Tasks
- Install Node.js 20, Docker Desktop, Git, VS Code, AWS CLI, and Terraform.
- Copy `.env.example` to `.env.development` and fill only the services you are testing.
- Run `npm ci`, `npx prisma generate`, `npm run dev`.
- Draw a simple diagram: Browser -> Next.js -> Prisma -> PostgreSQL -> external APIs.

📦 Code/Configs `package.json`, `.env.example`, `prisma/schema.prisma`.

✅ Expected Outcome You can explain the app startup flow and run it locally.

⚠️ Common Mistakes Putting secrets in Git. Fix by keeping `.env*` ignored and using `.env.example` for placeholders only.

Practice Task: Add one new variable to `.env.example` and document what it does.

## 2. Linux & Basic Networking

🎯 Goal Become comfortable with the commands and networking ideas used in deployments.

📚 Concepts to Learn Processes, ports, HTTP, DNS, IP addresses, firewalls, environment variables, logs, and file permissions.

⏱️ Recommended Study Time 8-12 hours total. Daily plan: 2 hours/day for 1 week.

🛠️ Hands-on Tasks
- Use WSL or a Linux VM.
- Practice `ls`, `cd`, `pwd`, `cat`, `grep`, `curl`, `ps`, `top`, `chmod`, `chown`.
- Run `curl http://localhost:3000/api/health`.
- Learn the difference between `localhost`, `0.0.0.0`, and a public IP.

📦 Code/Configs `src/app/api/health/route.ts`.

✅ Expected Outcome You can inspect a running service and verify if it is healthy.

⚠️ Common Mistakes App listens on `localhost` inside a container and cannot be reached. Fix by binding to `0.0.0.0`.

Practice Task: Start the app, find its process, hit the health endpoint with `curl`, then stop it.

## 3. Git & Version Control Best Practices

🎯 Goal Work safely with branches, commits, PRs, and protected environments.

📚 Concepts to Learn Branches isolate work, commits create history, PRs review changes, `.gitignore` prevents accidental secret leaks.

⏱️ Recommended Study Time 6-10 hours total. Daily plan: 1-2 hours/day for 1 week.

🛠️ Hands-on Tasks
- Create feature branches like `codex/dockerize-app`.
- Commit small logical changes.
- Use PR checks before merging.
- Never commit `.env`, certificates, `.next`, or `node_modules`.

📦 Code/Configs `.gitignore`, `.dockerignore`, `.github/workflows/ci.yml`.

✅ Expected Outcome Every change is reviewable and CI validates it.

⚠️ Common Mistakes Giant commits with unrelated changes. Fix by committing one topic at a time.

Practice Task: Create a branch, change a README line, commit it, and open a PR.

## 4. Docker

🎯 Goal Package the Next.js app into a repeatable production image.

📚 Concepts to Learn Images are templates, containers are running instances, multi-stage builds keep images smaller, health checks tell platforms if the app is alive.

⏱️ Recommended Study Time 12-16 hours total. Daily plan: 2 hours/day for 1 week.

🛠️ Hands-on Tasks
- Build the image with `docker build -t fuzzie-app:local .`.
- Run it with `docker run --env-file .env.docker.local -p 3000:3000 fuzzie-app:local`.
- Check logs with `docker logs`.
- Inspect image size with `docker images`.

📦 Code/Configs `Dockerfile`, `.dockerignore`, `docker-entrypoint.sh`.

✅ Expected Outcome The app runs the same way on your laptop and in the cloud.

⚠️ Common Mistakes Copying `node_modules` from your laptop into the image. Fix by using `npm ci` inside the Docker build.

Practice Task: Break one env var, observe the failure, then fix it.

## 5. Docker Compose

🎯 Goal Run app + PostgreSQL together for local DevOps practice.

📚 Concepts to Learn Compose creates a small local environment with networks, volumes, service names, and health checks.

⏱️ Recommended Study Time 10-14 hours total. Daily plan: 2 hours/day for 1 week.

🛠️ Hands-on Tasks
- Copy `.env.docker.example` to `.env.docker.local`.
- Create and commit your first Prisma migration with `npx prisma migrate dev --name init` before using real production data.
- Run `docker compose up --build`.
- Open `http://localhost:3000/api/health`.
- Stop with `docker compose down`.
- Reset database only when needed with `docker compose down -v`.

📦 Code/Configs `docker-compose.yml`, `.env.docker.example`.

✅ Expected Outcome App and database start with one command.

⚠️ Common Mistakes Using `localhost` for the database inside Docker. Fix by using the Compose service name `postgres`.

Practice Task: Connect to the database container and list databases.

## 6. Cloud Fundamentals: AWS

🎯 Goal Understand the AWS services used in this deployment.

📚 Concepts to Learn ECS runs containers, Fargate removes server management, ALB receives public traffic, RDS hosts PostgreSQL, ECR stores Docker images, CloudWatch stores logs, Secrets Manager stores secrets.

⏱️ Recommended Study Time 14-20 hours total. Daily plan: 2 hours/day for 2 weeks.

🛠️ Hands-on Tasks
- Create an AWS account budget alert.
- Install and configure AWS CLI.
- Learn IAM users, roles, policies, and least privilege.
- Push one image to ECR manually.

📦 Code/Configs `infra/terraform/aws`.

✅ Expected Outcome You can explain each AWS resource in the architecture.

⚠️ Common Mistakes Leaving public cloud resources running. Fix by setting budgets and destroying practice infra when finished.

Practice Task: Create an ECR repository manually, push a test image, then delete it.

## 7. CI/CD Pipeline Setup

🎯 Goal Automatically validate and deploy changes.

📚 Concepts to Learn CI checks code quality; CD ships a successful build to production. OIDC lets GitHub assume an AWS role without long-lived AWS keys.

⏱️ Recommended Study Time 12-18 hours total. Daily plan: 2 hours/day for 1-2 weeks.

🛠️ Hands-on Tasks
- Enable GitHub Actions.
- Add repository secret `AWS_GITHUB_ACTIONS_ROLE_ARN`.
- Add GitHub environment variables for public build-time values such as `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_SCHEME`, and public OAuth redirect URLs.
- Run the CI workflow on a PR.
- Merge to `main` and deploy to ECS.

📦 Code/Configs `.github/workflows/ci.yml`, `.github/workflows/deploy-aws-ecs.yml`.

✅ Expected Outcome Push to `main` builds an image, pushes to ECR, and updates ECS.

⚠️ Common Mistakes Storing AWS access keys in GitHub secrets. Fix by using GitHub OIDC and an assumable AWS role.

Practice Task: Make a harmless UI text change and watch it deploy.

## 8. Infrastructure as Code

🎯 Goal Create AWS infrastructure repeatably with Terraform.

📚 Concepts to Learn Terraform state tracks real resources, plans preview changes, applies create/update resources, variables make environments configurable.

⏱️ Recommended Study Time 18-25 hours total. Daily plan: 2 hours/day for 2 weeks.

🛠️ Hands-on Tasks
- Copy `terraform.tfvars.example` to `terraform.tfvars`.
- Fill secrets locally, never commit `terraform.tfvars`.
- Run `terraform init`, `terraform plan`, `terraform apply`.
- Save outputs such as ALB DNS and ECR URL.

📦 Code/Configs `infra/terraform/aws/*.tf`.

✅ Expected Outcome AWS has ECS, ALB, RDS, ECR, CloudWatch logs, and Secrets Manager configured.

⚠️ Common Mistakes Committing Terraform state or tfvars with secrets. Fix by using remote state later and keeping secret files ignored.

Practice Task: Change `desired_count` from 2 to 1, run plan, then change it back.

## 9. Deployment Strategy

🎯 Goal Deploy with minimal downtime.

📚 Concepts to Learn Rolling deployments replace tasks gradually. Blue-green deployments run old and new versions side by side before switching traffic.

⏱️ Recommended Study Time 8-12 hours total. Daily plan: 2 hours/day for 1 week.

🛠️ Hands-on Tasks
- Start with ECS rolling deployments.
- Keep `desired_count = 2`.
- Watch ECS replace tasks after a deployment.
- Later, add AWS CodeDeploy for blue-green.

📦 Code/Configs `aws_ecs_service.app` in Terraform uses rolling deployment settings.

✅ Expected Outcome A new image can deploy while at least one healthy task keeps serving traffic.

⚠️ Common Mistakes Running only one task and calling it production-ready. Fix by running at least two tasks across two availability zones.

Practice Task: Deploy twice and watch target health in the ALB target group.

## 10. Monitoring & Logging

🎯 Goal Know when the app is down and how to debug it.

📚 Concepts to Learn Logs explain what happened, metrics show trends, alarms notify you before users do, health checks detect broken tasks.

⏱️ Recommended Study Time 12-16 hours total. Daily plan: 2 hours/day for 1-2 weeks.

🛠️ Hands-on Tasks
- Open CloudWatch logs for `/ecs/fuzzie-prod`.
- Create alarms for high 5xx count, unhealthy hosts, CPU, and memory.
- Use `/api/health` as the ALB health path.

📦 Code/Configs CloudWatch log group in Terraform and health endpoint in the app.

✅ Expected Outcome You can find app errors and know if production is healthy.

⚠️ Common Mistakes Only checking logs after something breaks. Fix by adding alarms and dashboards early.

Practice Task: Force a bad deployment in a test environment and observe the alarm.

## 11. Security Best Practices

🎯 Goal Reduce risk from leaked secrets, open networks, vulnerable images, and overpowered permissions.

📚 Concepts to Learn Least privilege, private databases, secret rotation, image scanning, HTTPS, dependency updates, and environment separation.

⏱️ Recommended Study Time 14-20 hours total. Daily plan: 2 hours/day for 2 weeks.

🛠️ Hands-on Tasks
- Store production secrets in AWS Secrets Manager.
- Keep RDS private.
- Enable ECR image scanning.
- Add HTTPS with ACM and Route 53.
- Rotate OAuth and webhook secrets after practice.

📦 Code/Configs Terraform security groups, Secrets Manager, ECR scan-on-push.

✅ Expected Outcome App secrets are not in Git or container images, and the database is not public.

⚠️ Common Mistakes Treating `NEXT_PUBLIC_*` as secret. Fix by remembering those values are exposed to browsers.

Practice Task: Run `npm audit`, review results, and fix safe updates.

## 12. Scaling & Optimization

🎯 Goal Make the app handle more users without waste.

📚 Concepts to Learn Horizontal scaling adds more tasks, vertical scaling adds CPU/memory, caching reduces repeated work, database connection limits matter.

⏱️ Recommended Study Time 12-18 hours total. Daily plan: 2 hours/day for 1-2 weeks.

🛠️ Hands-on Tasks
- Add ECS autoscaling by CPU or request count.
- Watch Prisma database connections.
- Add CDN caching for static assets later with CloudFront.
- Load test the health endpoint and one real page.

📦 Code/Configs Extend Terraform with `aws_appautoscaling_target` and `aws_appautoscaling_policy`.

✅ Expected Outcome You understand when to increase task count, CPU, memory, or database size.

⚠️ Common Mistakes Scaling the app but forgetting the database. Fix by monitoring RDS CPU, memory, and connections.

Practice Task: Run a small load test in staging and compare ECS/RDS metrics.

## First Production Checklist

- CI passes on `main`.
- Docker image builds locally.
- `docker compose up --build` starts app and PostgreSQL.
- `/api/health` returns `200`.
- Terraform plan looks correct.
- AWS budget alert exists.
- Secrets are in Secrets Manager, not Git.
- RDS is private.
- ECS service has at least two tasks.
- CloudWatch logs show app startup.
- OAuth callback URLs match the production domain.
- DNS and HTTPS are configured before inviting real users.

## Free Resources

- Docker: https://docs.docker.com/get-started/
- GitHub Actions: https://docs.github.com/actions
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- AWS ECS Workshop: https://ecsworkshop.com/
- Prisma Deploy Migrations: https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
- Linux Journey: https://linuxjourney.com/
- Roadmap.sh DevOps: https://roadmap.sh/devops

