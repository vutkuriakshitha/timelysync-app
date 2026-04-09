package com.timelysync.service;

import com.timelysync.model.LinkedAccount;
import com.timelysync.model.User;
import com.timelysync.payload.response.AccountDto;
import com.timelysync.repository.LinkedAccountRepository;
import com.timelysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    
    @Autowired
    private LinkedAccountRepository linkedAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<AccountDto> getLinkedAccounts(User user) {
        List<AccountDto> accounts = new ArrayList<>();
        
        // Add current account
        accounts.add(mapToAccountDto(user));
        
        // Add linked accounts
        List<LinkedAccount> linked = linkedAccountRepository.findByPrimaryUserId(user.getId());
        for (LinkedAccount link : linked) {
            userRepository.findById(link.getLinkedUserId())
                .map(this::mapToAccountDto)
                .ifPresent(accounts::add);
        }
        
        return accounts;
    }
    
    @Transactional
    public User switchAccount(User currentUser, String accountId) {
        // Check if the account is the current user or linked
        boolean isOwnAccount = currentUser.getId().equals(accountId);
        boolean isLinked = linkedAccountRepository.findByPrimaryUserId(currentUser.getId()).stream()
            .anyMatch(link -> link.getLinkedUserId().equals(accountId));
        
        if (isOwnAccount || isLinked) {
            currentUser.setCurrentAccountId(accountId);
            return userRepository.save(currentUser);
        }
        
        throw new RuntimeException("Account not accessible");
    }
    
    private AccountDto mapToAccountDto(User user) {
        AccountDto dto = new AccountDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        dto.setType(user.getAccountType());
        return dto;
    }
}
