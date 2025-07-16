output "lambda_role_id" {
  value = aws_iam_role.lambda_execution_role.id
}

output "invoke_arn" {
  value = aws_lambda_function.go_lambda.invoke_arn
}

output "arn" {
  value = aws_lambda_function.go_lambda.arn
}
