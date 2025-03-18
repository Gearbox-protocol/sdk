export const iBytecodeRepositoryAbi = [
  {
    type: "function",
    name: "AUDIT_REPORT_TYPEHASH",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BYTECODE_TYPEHASH",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addAuditor",
    inputs: [
      { name: "auditor", type: "address", internalType: "address" },
      { name: "name", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addPublicDomain",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowPublicContract",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowSystemContract",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "computeAddress",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
      { name: "constructorParams", type: "bytes", internalType: "bytes" },
      { name: "salt", type: "bytes32", internalType: "bytes32" },
      { name: "deployer", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "computeAuditReportHash",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
      {
        name: "report",
        type: "tuple",
        internalType: "struct AuditReport",
        components: [
          { name: "auditor", type: "address", internalType: "address" },
          { name: "reportUrl", type: "string", internalType: "string" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "computeBytecodeHash",
    inputs: [
      {
        name: "bytecode",
        type: "tuple",
        internalType: "struct Bytecode",
        components: [
          { name: "contractType", type: "bytes32", internalType: "bytes32" },
          { name: "version", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "author", type: "address", internalType: "address" },
          { name: "source", type: "string", internalType: "string" },
          { name: "authorSignature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deploy",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
      { name: "constructorParams", type: "bytes", internalType: "bytes" },
      { name: "salt", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "domainSeparatorV4",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "forbidInitCode",
    inputs: [
      { name: "initCodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllowedBytecodeHash",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAuditReport",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
      { name: "index", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AuditReport",
        components: [
          { name: "auditor", type: "address", internalType: "address" },
          { name: "reportUrl", type: "string", internalType: "string" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAuditReports",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct AuditReport[]",
        components: [
          { name: "auditor", type: "address", internalType: "address" },
          { name: "reportUrl", type: "string", internalType: "string" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAuditorName",
    inputs: [{ name: "auditor", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAuditors",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBytecode",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Bytecode",
        components: [
          { name: "contractType", type: "bytes32", internalType: "bytes32" },
          { name: "version", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "author", type: "address", internalType: "address" },
          { name: "source", type: "string", internalType: "string" },
          { name: "authorSignature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContractTypeOwner",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDeployedContractBytecodeHash",
    inputs: [
      { name: "deployedContract", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestMinorVersion",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "majorVersion", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestPatchVersion",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "minorVersion", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestVersion",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNumAuditReports",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPublicDomains",
    inputs: [],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSystemDomains",
    inputs: [],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenSpecificPostfix",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVersions",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAuditor",
    inputs: [{ name: "auditor", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isBytecodeAudited",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isBytecodeUploaded",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDeployedFromRepository",
    inputs: [
      { name: "deployedContract", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isInitCodeForbidden",
    inputs: [
      { name: "initCodeHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isPublicDomain",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isSystemDomain",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeAuditor",
    inputs: [{ name: "auditor", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removePublicContractType",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenSpecificPostfix",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "postfix", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitAuditReport",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
      {
        name: "auditReport",
        type: "tuple",
        internalType: "struct AuditReport",
        components: [
          { name: "auditor", type: "address", internalType: "address" },
          { name: "reportUrl", type: "string", internalType: "string" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uploadBytecode",
    inputs: [
      {
        name: "bytecode",
        type: "tuple",
        internalType: "struct Bytecode",
        components: [
          { name: "contractType", type: "bytes32", internalType: "bytes32" },
          { name: "version", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "author", type: "address", internalType: "address" },
          { name: "source", type: "string", internalType: "string" },
          { name: "authorSignature", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AddAuditor",
    inputs: [
      {
        name: "auditor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "name", type: "string", indexed: false, internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddPublicDomain",
    inputs: [
      {
        name: "domain",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddSystemDomain",
    inputs: [
      {
        name: "domain",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AllowContract",
    inputs: [
      {
        name: "bytecodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "version",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AuditBytecode",
    inputs: [
      {
        name: "bytecodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "auditor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "reportUrl",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "signature",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DeployContract",
    inputs: [
      {
        name: "bytecodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "version",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "contractAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ForbidContract",
    inputs: [
      {
        name: "bytecodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "version",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ForbidInitCode",
    inputs: [
      {
        name: "initCodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveAuditor",
    inputs: [
      {
        name: "auditor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveContractTypeOwner",
    inputs: [
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetContractTypeOwner",
    inputs: [
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenSpecificPostfix",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "postfix",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UploadBytecode",
    inputs: [
      {
        name: "bytecodeHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "version",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "author",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "source",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "signature",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AuditorIsNotApprovedException",
    inputs: [{ name: "auditor", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AuthorIsNotContractTypeOwnerException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "author", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "BytecodeIsAlreadyAllowedException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "BytecodeIsAlreadySignedByAuditorException",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
      { name: "auditor", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "BytecodeIsNotAllowedException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "BytecodeIsNotAuditedException",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "BytecodeIsNotUploadedException",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "CallerIsNotBytecodeAuthorException",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "CallerIsNotOwnerException",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ContractIsAlreadyDeployedException",
    inputs: [
      { name: "deployedContract", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ContractTypeIsNotInPublicDomainException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "DomainIsAlreadyMarkedAsPublicException",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "DomainIsAlreadyMarkedAsSystemException",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "InitCodeIsForbiddenException",
    inputs: [
      { name: "initCodeHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "InvalidAuditorSignatureException",
    inputs: [{ name: "auditor", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidAuthorSignatureException",
    inputs: [{ name: "author", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidBytecodeException",
    inputs: [
      { name: "bytecodeHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "InvalidContractTypeException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "InvalidDomainException",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "InvalidVersionException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
      { name: "version", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "VersionNotFoundException",
    inputs: [
      { name: "contractType", type: "bytes32", internalType: "bytes32" },
    ],
  },
] as const;
