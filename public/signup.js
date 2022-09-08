function signup() {
    const userId =  $(".user_id").val();
    const userPw = $(".user_pw").val();
    const userPwRe = $(".user_pw_re").val();
     
    const idCheck = /^(?=.*[a-z0-9]){5,10}$/;
    const pwCheck = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    const checkPwNumber = userPw.search(/[0-9]/g);
    const checkPwEnglish = userPw.search(/[a-z]/ig);

    if(userId === '' && userPw === '' && userPwRe === '' && userNikname === '') {
        alert("입력된 값이 없습니다"); 
        return false;
    };
    if(userId === '' && userPw === '' && userPwRe === '') {
        alert("아이디와 비밀번호, 비밀번호 재확인을 입력해주세요"); 
        return false;
    };
    if(userId === '' && userPw === '' && userNikname === '') {
        alert("아이디와 비밀번호, 닉네임을 입력해주세요"); 
        return false;
    };
    if(userId === '' && userPwRe === '' && userNikname === '') {
        alert("아이디와 비밀번호 재확인, 닉네임을 입력해주세요"); 
        return false;
    };
    if(userPw === '' && userPwRe === '' && userNikname === '') {
        alert("비밀번호와 비밀번호 재확인, 닉네임을 입력해주세요"); 
        return false;
    };
    if(userId === '' && userPw === '') {
        alert("아이디와 비밀번호를 입력해주세요"); 
        return false;
    };
    if(userId === '' && userPwRe === '') {
        alert("아이디와 비밀번호 재확인을 입력해주세요"); 
        return false;
    };
    if(userId === '' && userNikname === '') {
        alert("아이디와 닉네임을 입력해주세요"); 
        return false;
    };
    if(userPw === '' && userPwRe === '') {
        alert("비밀번호와 비밀번호 재확인을 입력해주세요"); 
        return false;
    };
    if(userPw === '' && userNikname === '') {
        alert("비밀번호와 닉네임을 입력해주세요"); 
        return false;
    };
    if(userPwRe === '' && userNikname === '') {
        alert("비밀번호 재확인과 닉네임을 입력해주세요"); 
        return false;
    };
    if(userId === '') {
        alert("아이디를 입력해 주세요"); 
        return false;
    };
    if(userPw === '') {
        alert("비밀번호를 입력해 주세요"); 
        return false;
    };
    if(checkPwNumber < 0 || checkPwEnglish < 0){
        alert("숫자와 영문자를 혼용하여야 합니다.");
        return false;
    }
    if(/(\w)\1\1\1/.test(userPw)){
        alert('같은 문자를 4번 이상 사용하실 수 없습니다.');
        return false;
    }
    if(userPw.search(userId) > -1){
        alert("비밀번호에 아이디가 포함되었습니다.");
        return false;
    }
    if(!pwCheck.test(userPw)) {
        alert('특수문자를 입력해주세요')
        return false;
    }
    if(userPw !== userPwRe) {
        alert("비밀번호가 틀렸습니다"); 
        return false;
    };
    if(userPwRe === '') {
        alert("비밀번호를 재확인이 필요합니다"); 
        return false;
    };
    if(userNikname === '') {
        alert("닉네임를 입력해 주세요"); 
        return false;
    };
    if($('.user_check').is(":checked") == false){
        alert('정보제공에 동의가 필요합니다')
        return false;
    };
    if(confirm("회원가입을 하시겠습니까?")){
        alert("회원가입을 축하합니다");
        return true;
    };
}



