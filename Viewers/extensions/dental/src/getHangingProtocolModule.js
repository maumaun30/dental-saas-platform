const imageSeriesRules = [
  {
    attribute: 'numImageFrames',
    constraint: { greaterThan: { value: 0 } },
  },
  {
    attribute: 'isDisplaySetFromUrl',
    weight: 20,
    constraint: { equals: true },
  },
];

const currentSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: { equals: { value: 0 } },
    },
  ],
  seriesMatchingRules: imageSeriesRules,
};

const priorSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: false,
      constraint: { equals: { value: 1 } },
    },
  ],
  seriesMatchingRules: imageSeriesRules,
};

const viewport = (selectorId, matchedDisplaySetsIndex, label) => ({
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    viewportType: 'stack',
  },
  displaySets: [
    {
      id: selectorId,
      ...(matchedDisplaySetsIndex ? { matchedDisplaySetsIndex } : {}),
    },
  ],
});

const dentalProtocol = {
  id: 'dental2x2',
  name: 'Dental 2×2',
  locked: true,
  createdDate: '2026-06-16',
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    dentalCurrent: currentSelector,
    dentalPrior: priorSelector,
  },
  defaultViewport: {
    viewportOptions: { toolGroupId: 'default', allowUnmatchedView: true, viewportType: 'stack' },
    displaySets: [{ id: 'dentalCurrent', matchedDisplaySetsIndex: -1 }],
  },
  stages: [
    {
      id: 'dental2x2-stage',
      name: 'Dental 2×2',
      viewportStructure: {
        layoutType: 'grid',
        properties: { rows: 2, columns: 2 },
      },
      viewports: [
        viewport('dentalCurrent', 0, 'Current'),
        viewport('dentalPrior', 0, 'Prior'),
        viewport('dentalCurrent', 1, 'Bitewing L'),
        viewport('dentalCurrent', 2, 'Bitewing R'),
      ],
    },
  ],
};

export default function getHangingProtocolModule() {
  return [
    {
      name: dentalProtocol.id,
      protocol: dentalProtocol,
    },
  ];
}
