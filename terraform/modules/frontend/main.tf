# Use data source for existing S3 bucket for frontend hosting
data "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.environment}-frontend-oac-${formatdate("YYYYMMDD-HHmmss", timestamp())}"
  description                       = "Origin Access Control for ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = data.aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${data.aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"
  price_class        = "PriceClass_100"
  aliases            = [var.domain_name]

  origin {
    domain_name = data.aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${data.aws_s3_bucket.frontend.id}"

    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${data.aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress              = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  ordered_cache_behavior {
    path_pattern     = "/index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${data.aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

# Outputs
output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_distribution_arn" {
  value = aws_cloudfront_distribution.frontend.arn
}

output "s3_bucket_name" {
  value = data.aws_s3_bucket.frontend.id
}

output "s3_bucket_arn" {
  value = data.aws_s3_bucket.frontend.arn
} 