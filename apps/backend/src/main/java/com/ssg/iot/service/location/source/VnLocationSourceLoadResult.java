package com.ssg.iot.service.location.source;

public record VnLocationSourceLoadResult(
        String sourceTag,
        VnLocationDataset dataset,
        String error
) {
    public static VnLocationSourceLoadResult success(String sourceTag, VnLocationDataset dataset) {
        return new VnLocationSourceLoadResult(sourceTag, dataset, null);
    }

    public static VnLocationSourceLoadResult failure(String sourceTag, String error) {
        return new VnLocationSourceLoadResult(sourceTag, null, error);
    }

    public boolean isSuccess() {
        return dataset != null;
    }
}
