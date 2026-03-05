package com.ssg.iot.service;

import com.ssg.iot.dto.auth.ZaloProfileResponse;
import com.ssg.iot.dto.auth.ZaloTokenResponse;

public interface ZaloOAuthGateway {
    String buildAuthorizeUrl(String state);

    ZaloTokenResponse exchangeAuthorizationCode(String code);

    ZaloProfileResponse fetchUserProfile(String accessToken);
}
