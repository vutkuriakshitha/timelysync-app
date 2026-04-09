package com.timelysync.payload.request;

import javax.validation.constraints.NotNull;

public class SwitchAccountRequest {
    @NotNull
    private Long accountId;
    
    public Long getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
}