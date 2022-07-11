import { System, AsyncEventFlow } from '../../../model/ms'

import { verifyEachContentHasTransformer } from '../../../test/verifiers'

import { PatternAnalyzer } from './PatternAnalyzer'
import { SystemPattern, NodePattern, SearchTextLocation } from './model'

describe('PatternAnalyzer.interFileId', () => {
  const sourceFolder = __dirname + '/testdata/inter-file-id-project'

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  const ws = '\\s*'
  const id = '\\w+'

  function javaSourceFilePattern(): NodePattern {
    return {
      searchTextLocation: SearchTextLocation.FILE_PATH,
      regExp: '$sourceRoot/([^/]+)/source.java',
      capturingGroupIndexForName: 1,
      variableForName: 'serviceName',
      nodeType: 'MicroService'
    }
  }

  it('can resolve a name from the content of another file', async () => {
    const inputSystem = new System('test')

    const systemPattern: SystemPattern = {
      nodePatterns: [],
      edgePatterns: [
        {
          edgeType: 'AsyncEventFlow',
          sourceNodePattern: javaSourceFilePattern(),
          targetNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_CONTENT,
            regExp: `"(.+_KAFKA_TOPIC)"`,
            capturingGroupIndexForName: 1,
            variableForName: 'envName',
            nameResolutionPattern: {
              searchTextLocation: SearchTextLocation.ANY_FILE_PATH,
              regExp: `deploy-(.+)/.+\.yml`,
              capturingGroupIndexForName: 1,
              variableForName: 'deployServiceName',
              nameResolutionPattern: {
                searchTextLocation: SearchTextLocation.FILE_CONTENT,
                regExp: `name:\\s*$envName\\s*value:\\s*(\\w+)`,
                capturingGroupIndexForName: 1
              }
            },
            nodeType: 'MessageExchange'
          }
        }
      ]
    }

    const analyzer = new PatternAnalyzer(sourceFolder)
    const outputSystem = await analyzer.transform(inputSystem, systemPattern)

    expect(outputSystem.getAllEdges()).toHaveLength(1)
    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('actual_topic_name')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
  })

  it('only searches in files matching the file mask and not in excluded folders', async () => {
    const inputSystem = new System('test')

    const systemPattern: SystemPattern = {
      includedFileEndings: ['.yml'],
      excludedFolders: ['excluded'],
      nodePatterns: [
        {
          searchTextLocation: SearchTextLocation.FILE_PATH,
          regExp: '$sourceRoot/([^/]+)/.*',
          capturingGroupIndexForName: 1,
          variableForName: 'serviceName',
          nodeType: 'MicroService'
        }
      ],
      edgePatterns: []
    }

    const analyzer = new PatternAnalyzer(sourceFolder)
    const outputSystem = await analyzer.transform(inputSystem, systemPattern)

    expect(outputSystem.getMicroServices()).toHaveLength(1)
  })
})