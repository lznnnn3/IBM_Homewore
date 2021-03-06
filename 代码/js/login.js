$(function () {
    'use strict';
    // 先判断是否已登录
    // 登录界面先隐藏
    var info = is_login();
    if (info !== 0) {
        alert("您已登录，请勿重复登录");
        window.location.href="../index.html";
    } else {
        // 判定为未登录再显示登录界面
        $('body').removeClass('hide');
    }

    // 设置.active
    set_active("login");
    
    // 选中三个input
    var $ipt_id = $('#login-id'),
        $ipt_pass = $('#password'),
        $ipt_submit = $('#submit');
    
    $ipt_id.on('input', function() {
        show_and_hide();
    })

    $ipt_pass.on('input', function() {
        show_and_hide();
    })

    $ipt_submit.on('click', function(e) {
        e.preventDefault();
        validate_and_login();
    })

    function show_and_hide() {
        if ($ipt_id.val() !== '' && $ipt_pass.val() !== '') {
            $ipt_submit.removeAttr('disabled');
        } else {
            $ipt_submit.attr('disabled', 'disabled');
        }

        $('#id-not-exist-error').hide();
        $('#id-or-pass-error').hide();
    }

    function validate_and_login() {
        var data = grecaptcha.getResponse();
        $.ajax({
            type: "post",
            url: "../php/recaptcha.php",
            data: {
                'data': data,
            },
            success: function (validate_response) {
                validate_response = JSON.parse(validate_response);
                if (validate_response.success == 1) {
                    go_login();
                } else if (validate_response.code = '-1') {
                    alert('允许本次登录，但验证服务出错，请联系管理员，谢谢！');
                    go_login();
                } else {
                    alert('非正常登录');
                    window.location.href = '../index.html';
                }
            }
        });
    }

    function go_login() {
        var data = {};

        data['login-id'] = $ipt_id.val();
        data['password'] = $ipt_pass.val();

        $.ajax({
            type: "POST",
            url: "../php/login.php",
            data: data,
            success: function (response) {
                response = JSON.parse(response);
                if (response.success == '1') {
                    alert("登录成功");
                    if (response.mng == '1') {
                        window.location.href = '../admin/public.html';
                    }
                    // 判断上一个页面在哪
                    var search_info = window.location.search;
                    if (search_info.indexOf('?') != -1) {   
                        var from = get_query_string('f');
                        if (from == 'b') {
                            var length = search_info.length;
                                search_info = search_info.substr(0, length-4);
                            window.location.href = '../b_and_r/borrow.html' + search_info;
                        } else if (from == 'r') {
                            window.location.href = '../b_and_r/return.html';
                        } else if (from == 'p'){
                            window.location.href = '../admin/public.html'; 
                        }                        
                    } else {
                        window.location.href = '../index.html';
                    }
                } else if (response.code == '-1') {
                    alert(response.msg)
                } else if (response.code == '-2') {
                    // 用户名不存在
                    $ipt_pass.val("");
                    $ipt_id.select();
                    $('#id-not-exist-error').show();
                } else if (response.code == '-3') {
                    // 用户名或密码错误
                    $ipt_pass.select();
                    $('#id-or-pass-error').show();
                }
            },
        });
    }

    function is_login() {
        var info;
    
        $.ajax({
            type: "GET",
            url: "../php/is_login.php",
            // 这里一定要加下面这一句，不然无返回值，又因为是初始化页面的函数，所以同步也不是很影响用户体验
            async : false,
            success: function (response) {
                response = JSON.parse(response);
                if (response.logged === true) {
                    info = response.info;
                } else {
                    info = 0;
                }
            }
        });
        
        return info;
    }
})