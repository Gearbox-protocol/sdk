export const iBytecodeRepositoryAbi = [
  {
    type: "function",
    inputs: [],
    name: "AUDIT_REPORT_TYPEHASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "BYTECODE_TYPEHASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "auditor", internalType: "address", type: "address" },
      { name: "name", internalType: "string", type: "string" },
    ],
    name: "addAuditor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "addPublicDomain",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "allowPublicContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "allowSystemContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
      { name: "constructorParams", internalType: "bytes", type: "bytes" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "deployer", internalType: "address", type: "address" },
    ],
    name: "computeAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "report",
        internalType: "struct AuditReport",
        type: "tuple",
        components: [
          { name: "auditor", internalType: "address", type: "address" },
          { name: "reportUrl", internalType: "string", type: "string" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "computeAuditReportHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "bytecode",
        internalType: "struct Bytecode",
        type: "tuple",
        components: [
          { name: "contractType", internalType: "bytes32", type: "bytes32" },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "author", internalType: "address", type: "address" },
          { name: "source", internalType: "string", type: "string" },
          { name: "authorSignature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "computeBytecodeHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
      { name: "constructorParams", internalType: "bytes", type: "bytes" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "deploy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "domainSeparatorV4",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "initCodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "forbidInitCode",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
    ],
    name: "getAllowedBytecodeHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getAuditReport",
    outputs: [
      {
        name: "",
        internalType: "struct AuditReport",
        type: "tuple",
        components: [
          { name: "auditor", internalType: "address", type: "address" },
          { name: "reportUrl", internalType: "string", type: "string" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getAuditReports",
    outputs: [
      {
        name: "",
        internalType: "struct AuditReport[]",
        type: "tuple[]",
        components: [
          { name: "auditor", internalType: "address", type: "address" },
          { name: "reportUrl", internalType: "string", type: "string" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "auditor", internalType: "address", type: "address" }],
    name: "getAuditorName",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAuditors",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getBytecode",
    outputs: [
      {
        name: "",
        internalType: "struct Bytecode",
        type: "tuple",
        components: [
          { name: "contractType", internalType: "bytes32", type: "bytes32" },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "author", internalType: "address", type: "address" },
          { name: "source", internalType: "string", type: "string" },
          { name: "authorSignature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getContractTypeOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "deployedContract", internalType: "address", type: "address" },
    ],
    name: "getDeployedContractBytecodeHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "majorVersion", internalType: "uint256", type: "uint256" },
    ],
    name: "getLatestMinorVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
    ],
    name: "getLatestPatchVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getLatestVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getNumAuditReports",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPublicDomains",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getSystemDomains",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenSpecificPostfix",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getVersions",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "auditor", internalType: "address", type: "address" }],
    name: "isAuditor",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "isBytecodeAudited",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "isBytecodeUploaded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "deployedContract", internalType: "address", type: "address" },
    ],
    name: "isDeployedFromRepository",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "initCodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "isInitCodeForbidden",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "isPublicDomain",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "isSystemDomain",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "auditor", internalType: "address", type: "address" }],
    name: "removeAuditor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "removePublicContractType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "postfix", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setTokenSpecificPostfix",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "auditReport",
        internalType: "struct AuditReport",
        type: "tuple",
        components: [
          { name: "auditor", internalType: "address", type: "address" },
          { name: "reportUrl", internalType: "string", type: "string" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "submitAuditReport",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "bytecode",
        internalType: "struct Bytecode",
        type: "tuple",
        components: [
          { name: "contractType", internalType: "bytes32", type: "bytes32" },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "author", internalType: "address", type: "address" },
          { name: "source", internalType: "string", type: "string" },
          { name: "authorSignature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "uploadBytecode",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auditor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
    ],
    name: "AddAuditor",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "domain",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "AddPublicDomain",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "domain",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "AddSystemDomain",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "bytecodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "AllowContract",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "bytecodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "auditor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "reportUrl",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "AuditBytecode",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "bytecodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "contractAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "constructorParams",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "DeployContract",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "bytecodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "ForbidContract",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "initCodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "ForbidInitCode",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auditor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemoveAuditor",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RemoveContractTypeOwner",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetContractTypeOwner",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "postfix",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "SetTokenSpecificPostfix",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "bytecodeHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "author",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "source",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "UploadBytecode",
  },
  {
    type: "error",
    inputs: [{ name: "auditor", internalType: "address", type: "address" }],
    name: "AuditorIsNotApprovedException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "author", internalType: "address", type: "address" },
    ],
    name: "AuthorIsNotContractTypeOwnerException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
    ],
    name: "BytecodeIsAlreadyAllowedException",
  },
  {
    type: "error",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
      { name: "auditor", internalType: "address", type: "address" },
    ],
    name: "BytecodeIsAlreadySignedByAuditorException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
    ],
    name: "BytecodeIsNotAllowedException",
  },
  {
    type: "error",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "BytecodeIsNotAuditedException",
  },
  {
    type: "error",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "BytecodeIsNotUploadedException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotBytecodeAuthorException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotOwnerException",
  },
  {
    type: "error",
    inputs: [
      { name: "deployedContract", internalType: "address", type: "address" },
    ],
    name: "ContractIsAlreadyDeployedException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "ContractTypeIsNotInPublicDomainException",
  },
  {
    type: "error",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "DomainIsAlreadyMarkedAsPublicException",
  },
  {
    type: "error",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "DomainIsAlreadyMarkedAsSystemException",
  },
  { type: "error", inputs: [], name: "InitCodeIsEmptyException" },
  {
    type: "error",
    inputs: [
      { name: "initCodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "InitCodeIsForbiddenException",
  },
  {
    type: "error",
    inputs: [{ name: "auditor", internalType: "address", type: "address" }],
    name: "InvalidAuditorSignatureException",
  },
  {
    type: "error",
    inputs: [{ name: "author", internalType: "address", type: "address" }],
    name: "InvalidAuthorSignatureException",
  },
  {
    type: "error",
    inputs: [
      { name: "bytecodeHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "InvalidBytecodeException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "InvalidContractTypeException",
  },
  {
    type: "error",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "InvalidDomainException",
  },
  {
    type: "error",
    inputs: [{ name: "postfix", internalType: "bytes32", type: "bytes32" }],
    name: "InvalidPostfixException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
      { name: "version", internalType: "uint256", type: "uint256" },
    ],
    name: "InvalidVersionException",
  },
  {
    type: "error",
    inputs: [
      { name: "contractType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "VersionNotFoundException",
  },
] as const;
