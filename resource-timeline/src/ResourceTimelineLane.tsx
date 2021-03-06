import { createElement, Ref, BaseComponent, CssDimValue, buildClassNameNormalizer, ContentHook, MountHook, elementClosest, memoizeObjArg } from '@fullcalendar/common'
import { Resource, ResourceApi, ResourceLaneContentArg, ResourceLaneHookPropsInput } from '@fullcalendar/resource-common'
import { TimelineLane, TimelineLaneCoreProps } from '@fullcalendar/timeline'


export interface ResourceTimelineLaneProps extends TimelineLaneCoreProps {
  elRef: Ref<HTMLTableRowElement>
  resource: Resource
  innerHeight: CssDimValue
  onHeightChange?: (rowEl: HTMLTableRowElement, isStable: boolean) => void
}


export class ResourceTimelineLane extends BaseComponent<ResourceTimelineLaneProps> {

  refineHookProps = memoizeObjArg(refineHookProps)
  normalizeClassNames = buildClassNameNormalizer<ResourceLaneContentArg>()


  render() {
    let { props, context } = this
    let { options } = context
    let hookProps = this.refineHookProps({ resource: props.resource, context})
    let customClassNames = this.normalizeClassNames(options.resourceLaneClassNames, hookProps)

    return (
      <tr ref={props.elRef}>
        <MountHook hookProps={hookProps} didMount={options.resourceLaneDidMount} willUnmount={options.resourceLaneWillUnmount}>
          {(rootElRef) => (
            <td ref={rootElRef} className={[ 'fc-timeline-lane', 'fc-resource' ].concat(customClassNames).join(' ')} data-resource-id={props.resource.id}>
              <div className='fc-timeline-lane-frame' style={{ height: props.innerHeight }}>
                <ResourceTimelineLaneMisc resource={props.resource} />
                <TimelineLane
                  dateProfile={props.dateProfile}
                  tDateProfile={props.tDateProfile}
                  nowDate={props.nowDate}
                  todayRange={props.todayRange}
                  nextDayThreshold={props.nextDayThreshold}
                  businessHours={props.businessHours}
                  eventStore={props.eventStore}
                  eventUiBases={props.eventUiBases}
                  dateSelection={props.dateSelection}
                  eventSelection={props.eventSelection}
                  eventDrag={props.eventDrag}
                  eventResize={props.eventResize}
                  timelineCoords={props.timelineCoords}
                  onHeightChange={this.handleHeightChange}
                />
              </div>
            </td>
          )}
        </MountHook>
      </tr>
    ) // important NOT to do liquid-height. dont want to shrink height smaller than content
  }


  handleHeightChange = (innerEl: HTMLElement, isStable: boolean) => {
    if (this.props.onHeightChange) {
      this.props.onHeightChange(
        elementClosest(innerEl, 'tr') as HTMLTableRowElement, // would want to use own <tr> ref, but not guaranteed to be ready when this fires
        isStable
      )
    }
  }

}


interface ResourceTimelineLaneMiscProps {
  resource: Resource
}

class ResourceTimelineLaneMisc extends BaseComponent<ResourceTimelineLaneMiscProps> {

  render() {
    let { props, context } = this
    let hookProps: ResourceLaneContentArg = { resource: new ResourceApi(context, props.resource) } // just easier to make directly

    return (
      <ContentHook hookProps={hookProps} content={context.options.resourceLaneContent}>
        {(innerElRef, innerContent) => (
          innerContent && // TODO: test how this would interfere with height
            <div className='fc-timeline-lane-misc' ref={innerElRef}>{innerContent}</div>
        )}
      </ContentHook>
    )
  }

}


function refineHookProps(raw: ResourceLaneHookPropsInput): ResourceLaneContentArg {
  return {
    resource: new ResourceApi(raw.context, raw.resource)
  }
}
