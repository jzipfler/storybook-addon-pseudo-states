import { makeDecorator, OptionsParameter, StoryContext, StoryGetter, WrapperSettings } from '@storybook/addons';
import { PseudoStatesParameters, StatesComposition, StatesCompositionDefault, WrapperPseudoStateSettings } from '../share/types';
import { PseudoStateWrapperComponent, PseudoStateWrapperContainer } from './PseudoStateWrapperComponents';


function getModuleMetadata(metadata: any) {
  const {moduleMetadata, component} = metadata;

  if (component && !moduleMetadata) {
    return {
      declarations: [metadata.component]
    };
  }

  if (component && moduleMetadata) {
    return {
      ...moduleMetadata,
      // add own wrapper components
      declarations: [...moduleMetadata.declarations, metadata.component, PseudoStateWrapperComponent, PseudoStateWrapperContainer]
    };
  }

  return moduleMetadata;
}

export const withPseudo = makeDecorator({
  name: 'withPseudo',
  parameterName: 'withPseudo',
  // This means don't run this decorator if the withPseudo decorator is not set
  skipIfNoParametersOrOptions: false,
  allowDeprecatedUsage: false,
  wrapper: (getStory: StoryGetter, context: StoryContext, settings: WrapperPseudoStateSettings) => {
    const metadata = getStory(context);
    const story = getStory(context);

    const compInternal = story.component.__annotations__[0];

    // are options set by user
    const options: OptionsParameter = settings?.options;

    // are parameters set by user
    const parameters: PseudoStatesParameters = settings?.parameters || {};

    if (parameters?.disabled) {
      return story;
    }

    let storyParameters = null;

    // use user values or default
    parameters.stateComposition = parameters.stateComposition || StatesCompositionDefault;
    if (parameters.prefix || options?.prefix) {
      parameters.prefix = parameters.prefix || options.prefix;
    }
    storyParameters = escape(JSON.stringify(parameters));

    let storyComponent = null;
    if (story.component && story.component.__annotations__[0]) {
      storyComponent = escape(JSON.stringify(story.component.__annotations__[0]));
    }

    const newTemplate = story.template ?
      // TODO component parameters are lost
      story.template : `<${compInternal.selector}>${compInternal.template}</${compInternal.selector}>`;


    return {
      ...metadata,
      template: `<pseudo-state-wrapper 
                        [parameters]="'${storyParameters}'"
                        [storyComponent]="'${storyComponent}'"
                    ><ng-template #storyTmpl>      
                        ${newTemplate}
                        </ng-template>
                    </pseudo-state-wrapper>`,
      moduleMetadata: getModuleMetadata(metadata),
      props: {
        ...metadata.props
      }
    };
  }
});