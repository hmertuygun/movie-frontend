sed s/"<IMAGE_VERSION>"/$1/g deployment_pr_template.yaml > deployment_1.yaml
sed s/"<GCP_PROJECT>"/$2/g deployment_1.yaml > deployment_2.yaml
sed s/"<IMAGE_NAME>"/$3/g deployment_2.yaml > deployment_pr.yaml