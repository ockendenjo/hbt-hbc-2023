resource "aws_route53_zone" "main" {
  name = "beerienteering.huntersbogtrotters.com"
}

output "name_servers" {
  value = aws_route53_zone.main.name_servers
}

resource "aws_route53_record" "a" {
  name    = aws_route53_zone.main.name
  type    = "A"
  zone_id = aws_route53_zone.main.zone_id

  alias {
    name                   = aws_cloudfront_distribution.cf_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.cf_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
