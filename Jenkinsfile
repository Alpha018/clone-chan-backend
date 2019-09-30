pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t ucn-chan-backend:QA . '
      }
    }
    stage('Deploy') {
      input {
          message "Should we continue?"
          ok "Yes, we should."
          parameters {
              string(name: 'NODE_ENV', defaultValue: 'production', description: '')
              string(name: 'APPLICATION_NAME', defaultValue: 'clone-clan', description: '')
              string(name: 'APPLICATION_IP_INFORMATION', defaultValue: 'http://ip-api.com/json', description: '')
              string(name: 'APPLICATION_IP_INFORMATION_CODE', defaultValue: '3403775', description: '')

              string(name: 'SPACE_ENDPOINT', defaultValue: 'sfo2.digitaloceanspaces.com', description: '')
              string(name: 'SPACE_ACCESS_KEY', description: '')
              string(name: 'SPACE_SECRET_KEY', description: '')
              string(name: 'SPACE_BUCKET', description: '')

              string(name: 'MONGO_HOST', defaultValue: 'ucn-chan-mongo', description: '')
              string(name: 'MONGO_PORT', defaultValue: '27017', description: '')
              string(name: 'MONGO_DATABASE', defaultValue: 'clonechan', description: '')
            }
      }
      when {
        branch 'dev'
      }
      steps {
        sh 'docker ps -q --filter "name=ucn-chan-back" | grep -q . && docker stop ucn-chan-back || echo Not Found'
        sh 'docker run --name ucn-chan-back --rm --net qa-ucn-chan -d -it -p 3010:3000 -e NODE_ENV=${NODE_ENV} -e APPLICATION_NAME=${APPLICATION_NAME} -e APPLICATION_IP_INFORMATION=${APPLICATION_IP_INFORMATION} -e APPLICATION_IP_INFORMATION_CODE=${APPLICATION_IP_INFORMATION_CODE} -e SPACE_ENDPOINT=${SPACE_ENDPOINT} -e SPACE_ACCESS_KEY=${SPACE_ACCESS_KEY} -e SPACE_SECRET_KEY=${SPACE_SECRET_KEY} -e SPACE_BUCKET=${SPACE_BUCKET} -e MONGO_HOST=${MONGO_HOST} -e MONGO_PORT=${MONGO_PORT} -e MONGO_USER=${MONGO_USER} -e MONGO_PASSWORD=${MONGO_PASSWORD} -e MONGO_DATABASE=${MONGO_DATABASE} ucn-chan-backend:QA'
      }
    }
  }
  post {
    failure {
      echo 'build is broken. notify team!'
    }
  }
}
