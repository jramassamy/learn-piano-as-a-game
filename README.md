sed -i'' -e 's/ACR_URL/ghcr.io/g' -e 's/AKS_URL/${{ secrets.AKS_URL }}/g' -e 's/IMAGE_LABEL/${{ github.sha }}/g' k8s.yaml

Sed command explanation:

SWAP ACR_URL to ghcr.io
SWAP AKS_URL to ${{AKS_URL}}
SWAP IMAGE_LABEL to ${{ github.sha }}
