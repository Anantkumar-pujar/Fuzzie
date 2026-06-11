variable "aws_region" {
  description = "AWS region for the production environment."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name used for AWS resources."
  type        = string
  default     = "fuzzie"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "prod"
}

variable "container_port" {
  description = "Port exposed by the Next.js container."
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "Fargate CPU units."
  type        = number
  default     = 512
}

variable "container_memory" {
  description = "Fargate memory in MiB."
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Number of app tasks to run."
  type        = number
  default     = 2
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "fuzzie"
}

variable "db_password" {
  description = "PostgreSQL master password. Pass with TF_VAR_db_password or a tfvars file that is not committed."
  type        = string
  sensitive   = true
}

variable "app_secrets_json" {
  description = "JSON object containing application secrets and public runtime config for ECS."
  type        = string
  sensitive   = true
  default     = "{}"
}
