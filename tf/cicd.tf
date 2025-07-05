resource "aws_iam_role" "cicd" {
  name                 = "BeerienteeringCICDRole"
  description          = "Used by GitHub actions to upload files to S3 bucket"
  max_session_duration = 3600

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::574363388371:oidc-provider/token.actions.githubusercontent.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:sub" = "repo:ockendenjo/hbt-hbc-2023:ref:refs/heads/main"
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "cloudfront_invalidate" {
  name = "AllowCloudFrontInvalidation"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          aws_cloudfront_distribution.cf_distribution.arn,
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "s3" {
  name = "AllowS3"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",
        ]
        Resource = [
          aws_s3_bucket.backend.arn,
          "${aws_s3_bucket.backend.arn}/*",
        ]
      }
    ]
  })
}

output "cicd_role" {
  value = aws_iam_role.cicd.arn
}
