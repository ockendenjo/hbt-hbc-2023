module "lambda_get_stashes" {
  source    = "./lambda"
  s3_bucket = "ockendenjo-beerienteering-tfstate-rghv9t93fw"
  s3_key    = "lambdas/get-stashes.zip"
  name      = "hbt-beerienteering-get-stashes"
  env_vars = {
    GO_LIVE_TIME = "2025-07-17T19:00:08+01:00"
    BUCKET_NAME  = aws_s3_bucket.backend.id
  }
}

resource "aws_lambda_permission" "get_stashes_allow_apig" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_get_stashes.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.my_api.execution_arn}/*"
}

resource "aws_iam_role_policy" "get_stashes_s3" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowS3"
        Action = [
          "s3:List*",
          "s3:GetObject*",
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.backend.arn,
          "${aws_s3_bucket.backend.arn}/*",
        ]
      },
    ]
  })
  role = module.lambda_get_stashes.lambda_role_id
}
