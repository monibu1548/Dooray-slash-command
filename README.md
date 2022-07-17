# Dooray-slash-command
NHN Dooray 슬래시 커맨드 개발/배포/운영 repo

## NHN Dooray 슬래시 커맨드란?


## Repo 디렉토리 구조
- src
  - interface : Dooray Sever <-> 슬래시 커맨드 서버와 통신하는 Format을 정의해 둔 파일을 모아둡니다
  - lib
  - service : 커맨드 단위로 서비스를 구분합니다
    - hi: 샘플 서비스입니다
      - router.ts : 커맨드 슬래시 구현체
    - remind: 리마인드 서비스
      - entity.ts: 리마인드 서비스에서 사용하는 entity
      - router.ts : 커맨드 슬래시 구현체. endpoint
      - service.ts : 구현체가 많은 경우 depth 분리를 위해 추가
    - {신규 서비스 디렉토리}
  - util: 커맨드 개발에 필요한 코드
  - index.ts : firebase functions 의 시작지점이 되는 코드. 신규 서비스 추가 시 router 등록 필요


## Github Action 을 활용한 배포 자동화
* develop 브랜치에 merge => staging 환경에 배포됩니다
* main 브랜치에 merge => production 환경에 배포됩니다
* [Firebase Dooray Slash Command Production](https://console.firebase.google.com/u/0/project/dooray-slash-command/overview) // 권한 필요
* [Firebase Dooray Slash Command Staging](https://console.firebase.google.com/u/0/project/dooray-slash-command-staging/overview) // 권한 필요

## 운영 환경
* Firebase 위에서 구동됩니다
* Firebase Functions 를 활용해 슬래시 커맨드 서버를 운영하고, Firestore를 사용해 DB 기능을 대체합니다
* Staging Firebase Project: 

## Contribution 방법
1. [Repo](https://github.com/monibu1548/Dooray-slash-command)를 Clone 받습니다.
2. Firebase 개발환경을 설정합니다. [Firebase CLI Reference](https://firebase.google.com/docs/cli)
3. ./functions 디렉토리에서 `npm run serve` 명령어로 커맨드 서버를 실행합니다
4. 다른 커맨드들을 참고하여 개발을 뚝딱뚝딱
5. [monibu1548/Dooray-slash-command](https://github.com/monibu1548/Dooray-slash-command/pulls)에 develop base로 PR을 날려주세요.
6. CI (지원 예정) 를 통과하면 develop 에 merge 가능하며, develop에 merge 되면 staging 환경에 자동 배포됩니다.
7. staging 환경에서 테스트 후 master로  merge 합니다.

## 현재 지원 Slash Command
* hi : 샘플
* remind : 리마인드, 예약

## 문의
monibu1548@gmail.com