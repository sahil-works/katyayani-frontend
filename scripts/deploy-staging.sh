name: Deploy Frontend Staging

on:
  push:
    branches:
      - dev

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to GHCR
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build Image
        run: |
          docker build \
            -t ghcr.io/${{ github.repository_owner }}/katyayani-frontend:staging \
            -t ghcr.io/${{ github.repository_owner }}/katyayani-frontend:${{ github.sha }} \
            .

      - name: Push Image
        run: |
          docker push ghcr.io/${{ github.repository_owner }}/katyayani-frontend:staging
          docker push ghcr.io/${{ github.repository_owner }}/katyayani-frontend:${{ github.sha }}