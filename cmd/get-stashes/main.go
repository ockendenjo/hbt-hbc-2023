package main

import (
	"context"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ockendenjo/handler"
)

type H = handler.Handler[events.APIGatewayProxyRequest, events.APIGatewayProxyResponse]

func main() {
	handler.BuildAndStart(func(awsConfig aws.Config) H {
		goLiveStr := handler.MustGetEnv("GO_LIVE_TIME")
		goLiveTime, err := time.Parse(time.RFC3339, goLiveStr)
		if err != nil {
			panic(err)
		}

		s3Client := s3.NewFromConfig(awsConfig)
		bucketName := handler.MustGetEnv("BUCKET_NAME")

		return buildHandler(s3Client, bucketName, goLiveTime)
	})
}

func buildHandler(s3Client *s3.Client, bucketName string, goLiveTime time.Time) H {
	return func(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

		objectKey := "demo.json"
		if time.Now().After(goLiveTime) {
			objectKey = "2025.json"
		}

		res, err := s3Client.GetObject(ctx, &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    &objectKey,
		})

		if err != nil {
			return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, nil
		}

		b, err := io.ReadAll(res.Body)
		if err != nil {
			return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError}, nil
		}

		return events.APIGatewayProxyResponse{StatusCode: http.StatusOK, Body: string(b), Headers: map[string]string{"Content-Type": "application/json"}}, nil
	}
}
