import { getLessonDetail } from '../api/api-call.js'; // Adjust the import path as necessary

document.addEventListener('DOMContentLoaded', async () => {
    const lessonTitleElement = document.getElementById('viewer-title');
    const lessonContentContainer = document.getElementById('lesson-content');

    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    console.log(lessonId, "lessonID");

    if (!lessonId) {
        lessonContentContainer.innerHTML = '<p class="text-red-500">Lesson ID is missing.</p>';
        return;
    }

    try {
        const lessonData = await getLessonDetail(lessonId);
        const lesson = lessonData.data;

        lessonTitleElement.textContent = lesson.Title;

        if (lesson.Sections && lesson.Sections.length > 0) {
            lesson.Sections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'mb-8'; // Increased margin for section spacing

                const headingElement = document.createElement('h3');
                headingElement.className = 'text-2xl font-semibold mb-4 text-purple-400'; // Purple heading
                headingElement.textContent = section.Heading;
                sectionDiv.appendChild(headingElement);

                const contentDiv = document.createElement('div');
                renderRichText(section.Content, contentDiv); // Re-use rich text rendering function
                sectionDiv.appendChild(contentDiv);

                lessonContentContainer.appendChild(sectionDiv);
            });
        } else {
            lessonContentContainer.innerHTML = '<p>No sections available for this lesson.</p>';
        }

    } catch (error) {
        console.error('Error fetching lesson detail:', error);
        lessonContentContainer.innerHTML = '<p class="text-red-500">Failed to load lesson details.</p>';
    }
});

// Re-use renderRichText and renderInlineText functions from course-detail.js (same as before)
function renderRichText(richTextArray, container) {
    if (!richTextArray) return;

    richTextArray.forEach(block => {
        if (block.type === 'paragraph') {
            const pElement = document.createElement('p');
            pElement.className = 'mb-4';
            renderInlineText(block.children, pElement);
            container.appendChild(pElement);
        } else if (block.type === 'list') {
            const listElement = document.createElement(block.format === 'ordered' ? 'ol' : 'ul');
            listElement.className = 'list-disc list-inside mb-4';
            block.children.forEach(listItem => {
                const listItemElement = document.createElement('li');
                renderInlineText(listItem.children, listItemElement);
                listElement.appendChild(listItemElement);
            });
            container.appendChild(listElement);
        }
        // Add more block types (heading, etc.) if needed based on your Strapi data
    });
}

function renderInlineText(childrenArray, parentElement) {
    childrenArray.forEach(child => {
        if (child.type === 'text') {
            let textSpan = document.createElement('span');
            textSpan.textContent = child.text;
            if (child.bold) {
                textSpan.classList.add('font-bold');
            }
            if (child.code) {
                const codeElement = document.createElement('code');
                codeElement.className = 'bg-gray-800 text-gray-100 px-2 py-1 rounded font-mono text-sm'; // Darker code background
                codeElement.textContent = child.text;
                parentElement.appendChild(codeElement);
                return; // Skip appending textSpan as we appended codeElement
            }
            parentElement.appendChild(textSpan);
        }
        // Handle other inline types if needed (e.g., links, italics)
    });
}