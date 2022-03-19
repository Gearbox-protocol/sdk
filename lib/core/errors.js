"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsInAlllCreditManagersError = exports.PathNotFoundError = exports.UserHasNotAccountError = exports.CreditManagerNotExistsError = exports.PoolNotExistsError = exports.IncorrectEthAddressError = exports.NetworkError = void 0;
var NetworkError = /** @class */ (function (_super) {
    __extends(NetworkError, _super);
    function NetworkError() {
        return _super.call(this, "errors.networkError") || this;
    }
    return NetworkError;
}(Error));
exports.NetworkError = NetworkError;
var IncorrectEthAddressError = /** @class */ (function (_super) {
    __extends(IncorrectEthAddressError, _super);
    function IncorrectEthAddressError() {
        return _super.call(this, "errors.incorrectEthAddressError") || this;
    }
    return IncorrectEthAddressError;
}(Error));
exports.IncorrectEthAddressError = IncorrectEthAddressError;
var PoolNotExistsError = /** @class */ (function (_super) {
    __extends(PoolNotExistsError, _super);
    function PoolNotExistsError() {
        return _super.call(this, "errors.poolDoesntExistsError") || this;
    }
    return PoolNotExistsError;
}(Error));
exports.PoolNotExistsError = PoolNotExistsError;
var CreditManagerNotExistsError = /** @class */ (function (_super) {
    __extends(CreditManagerNotExistsError, _super);
    function CreditManagerNotExistsError() {
        return _super.call(this, "errors.creditManagerDoesntExistsError") || this;
    }
    return CreditManagerNotExistsError;
}(Error));
exports.CreditManagerNotExistsError = CreditManagerNotExistsError;
var UserHasNotAccountError = /** @class */ (function (_super) {
    __extends(UserHasNotAccountError, _super);
    function UserHasNotAccountError() {
        return _super.call(this, "errors.noOpenedAccountsError") || this;
    }
    return UserHasNotAccountError;
}(Error));
exports.UserHasNotAccountError = UserHasNotAccountError;
var PathNotFoundError = /** @class */ (function (_super) {
    __extends(PathNotFoundError, _super);
    function PathNotFoundError() {
        return _super.call(this, "errors.pathNotFoundError") || this;
    }
    return PathNotFoundError;
}(Error));
exports.PathNotFoundError = PathNotFoundError;
var AccountsInAlllCreditManagersError = /** @class */ (function (_super) {
    __extends(AccountsInAlllCreditManagersError, _super);
    function AccountsInAlllCreditManagersError() {
        return _super.call(this, "errors.youOpenedAccountsInAllCreditManagersError") || this;
    }
    return AccountsInAlllCreditManagersError;
}(Error));
exports.AccountsInAlllCreditManagersError = AccountsInAlllCreditManagersError;
