Изменения в SDK для Securitize:
- Получать contractType underlying
- Получать SecuritizeFactory - будет доступно на underlying
- В CreditAccountService - если видим securitize underlying, выполняем openCreditAccount/multicall на SecuritizeFactory а не на Facade
- tokensToRegister - это пока нужно будет захардкодить в сдк. 
- В ликвидаторе и на фронте проверка KYC - одинаково, нужно дождаться появления метода/контракта
- Некоторый маппиннг маркетов -> куда пройти за KYC