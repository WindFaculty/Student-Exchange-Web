package com.ssg.iot.service.location.source;

public interface VnLocationSourceAdapter {
    String sourceTag();

    VnLocationSourceLoadResult load();
}
