# aws-playground

```
docker compose up
```

Point browser to: http://localhost:4566/health

```
aws --endpoint-url http://localhost:4566 --no-sign-request s3 mb s3://hp-nfl-data
```

brew install aws-sam-cli

aws configure

aws --endpoint-url=http://localhost:4566 s3 mb s3://hp-nfl-data

zip -r function.zip .

aws --endpoint-url=http://localhost:4566 \
lambda create-function --function-name my-lambda \    
--zip-file fileb://function.zip \
--handler index.handler --runtime nodejs12.x \
--role arn:aws:iam::000000000000:role/lambda-role

aws --endpoint-url=http://localhost:4566 \
lambda update-function-code --function-name my-lambda \
--zip-file fileb://function.zip


aws --endpoint-url=http://localhost:4566 logs tail '/aws/lambda/my-lambda' --follow