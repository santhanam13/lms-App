import { getCourseDetail } from '../api/api-call.js'; // Adjust the import path as necessary

document.addEventListener('DOMContentLoaded', async () => {
    const courseTitleElement = document.getElementById('detail-title');
    const descriptionContainer = document.getElementById('description-container');
    const lessonsList = document.getElementById('lessons-list');

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    console.log(courseId, "courseID");

    if (!courseId) {
        descriptionContainer.innerHTML = '<p class="text-red-500">Course ID is missing.</p>';
        return;
    }

    try {
        const courseData = await getCourseDetail(courseId);
        const course = courseData.data;

        courseTitleElement.textContent = course.Title;
        renderRichText(course.Description, descriptionContainer); // Function to render rich text

        if (course.lessons && course.lessons.length > 0) {
            course.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                const lessonLink = document.createElement('a');
                lessonLink.href = `lesson-viewer.html?id=${lesson.documentId}`;
                lessonLink.textContent = lesson.Title;
                lessonLink.className = 'text-purple-500 hover:text-purple-400 transition-colors duration-200'; // Purple links for lessons
                lessonItem.appendChild(lessonLink);
                lessonsList.appendChild(lessonItem);
            });
        } else {
            lessonsList.innerHTML = '<li>No lessons available for this course.</li>';
        }

    } catch (error) {
        console.error('Error fetching course detail:', error);
        descriptionContainer.innerHTML = '<p class="text-red-500">Failed to load course details.</p>';
    }
});

// Function to render rich text description (same as before)
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