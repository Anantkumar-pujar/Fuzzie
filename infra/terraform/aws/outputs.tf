output "alb_dns_name" {
  description = "Public URL for the application load balancer."
  value       = aws_lb.app.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository where CI/CD pushes images."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.app.name
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret containing app environment variables."
  value       = aws_secretsmanager_secret.app.name
}
