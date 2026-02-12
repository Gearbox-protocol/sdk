Изменения в SDK для Securitize:
- Получать contractType underlying
- Получать SecuritizeFactory - будет доступно на underlying
- В CreditAccountService - если видим securitize underlying, выполняем openCreditAccount/multicall на SecuritizeFactory а не на Facade
- Откуда берем tokensToRegister - просто хардкодим в сдк мапке adrress SecurutizeFactory -> Tokens[] 
- В ликвидаторе и на фронте проверка KYC - одинаково, нужно дождаться появления метода/контракта
