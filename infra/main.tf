module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_apprunner_service" "engine" {
  service_name = "${var.app_runner_service_name}-${var.environment}"

  source_configuration {
    image_repository {
      image_identifier      = "public.ecr.aws/ferroui/engine:latest"
      image_repository_type = "ECR_PUBLIC"
      image_configuration {
        port = var.container_port
        runtime_environment_variables = {
          NODE_ENV = var.environment
        }
      }
    }
    auto_deployments_enabled = true
  }

  network_configuration {
    egress_configuration {
      egress_type = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.connector.arn
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_apprunner_vpc_connector" "connector" {
  vpc_connector_name = "${var.project_name}-vpc-connector-${var.environment}"
  subnets            = module.vpc.private_subnets
  security_groups    = [aws_security_group.app_runner.id]
}

resource "aws_security_group" "app_runner" {
  name        = "${var.project_name}-app-runner-sg-${var.environment}"
  description = "Security group for App Runner"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
