import type { Schema, Struct } from '@strapi/strapi';

export interface DefaultLessonSection extends Struct.ComponentSchema {
  collectionName: 'components_default_lesson_sections';
  info: {
    displayName: 'lessonSection';
  };
  attributes: {
    Content: Schema.Attribute.Blocks;
    Heading: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'default.lesson-section': DefaultLessonSection;
    }
  }
}
