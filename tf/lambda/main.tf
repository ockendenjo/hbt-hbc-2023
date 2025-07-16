resource "aws_iam_role" "lambda_execution_role" {
  name = "lambda-${var.name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name}"
  skip_destroy      = false
  retention_in_days = 30
}

resource "aws_lambda_function" "go_lambda" {
  function_name = var.name
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"

  s3_bucket = var.s3_bucket
  s3_key    = var.s3_key

  architectures = ["arm64"]
  memory_size   = 1024
  timeout       = var.timeout

  environment {
    variables = var.env_vars
  }

  publish = false
}
