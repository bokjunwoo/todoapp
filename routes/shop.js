const { application } = require('express');

const router = require('express').Router();

function 로그인했니(요청, 응답, next){
    if(요청.user){
        next()
    } else {
        응답.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        응답.write(`<script>alert('로그인이 필요합니다.')</script>`);
        응답.write("<script>window.location=\"/login\"</script>");
    };
};

// 전체적용
router.use(로그인했니);
// '/shirts'에만 적용
router.use('/shirts', 로그인했니);

router.get('/shirts', function (요청, 응답) {
    응답.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function (요청, 응답) {
    응답.send('바지 파는 페이지입니다.');
});

module.exports = router;