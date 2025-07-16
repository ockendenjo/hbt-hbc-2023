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
		previewKey := handler.MustGetEnv("PREVIEW_KEY")

		return buildHandler(s3Client, bucketName, goLiveTime, previewKey)
	})
}

func getKey(ctx context.Context, liveTime time.Time, parameters map[string]string, previewKey string) string {
	logger := handler.GetLogger(ctx)
	if time.Now().After(liveTime) {
		logger.Info("File is live")
		return "2025.json"
	}
	if parameters["key"] == previewKey {
		logger.Info("Preview key supplied")
		return "2025.json"
	}

	logger.Info("Event is not yet live")
	return "demo.json"
}

func buildHandler(s3Client *s3.Client, bucketName string, goLiveTime time.Time, previewKey string) H {
	return func(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

		objectKey := getKey(ctx, goLiveTime, event.QueryStringParameters, previewKey)

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
