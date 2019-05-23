import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/config.service'
import { System } from '../../model/ms'

@Injectable()
export class ExcludedNodesRemover {
  private readonly logger = new Logger(ExcludedNodesRemover.name)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System): Promise<System> {
    const namesToRemove = this.config.getExcludedNodeNames()

    system.edges = system.edges
      .filter(edge => {
        const sourceNodeName = edge.source.content.payload.name
        const targetNodeName = edge.target.content.payload.name
        if (namesToRemove.includes(sourceNodeName)
          || namesToRemove.includes(targetNodeName)) {
          this.logger.log(`removing edge ${sourceNodeName} -> ${targetNodeName} of excluded node`)
          return false
        }
        return true
      })

    system.nodes = system.nodes
      .filter(node => {
        const nodeName = node.content.payload.name
        if (namesToRemove.includes(nodeName)) {
          this.logger.log('removing excluded node named ' + nodeName)
          return false
        }
        return true
      })

    return system
  }

}