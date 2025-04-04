import { getCourseDetail } from '../api/api-call.js';  

document.addEventListener('DOMContentLoaded', async () => {
 
    const courseTitleElement = document.getElementById('detail-title');
    const descriptionContainer = document.getElementById('description-container');
    const lessonsList = document.getElementById('lessons-list');
    const lessonCounter = document.getElementById('lesson-counter');
    const startCourseBtn = document.getElementById('start-course-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    console.log(courseId, "courseID");

    if (!courseId) {
        descriptionContainer.innerHTML = '<p class="text-red-500 font-medium">Course ID is missing. Please return to the catalog and select a course.</p>';
        lessonCounter.textContent = "No Lessons";
        return;
    }

    try {
        const courseData = await getCourseDetail(courseId);
        const course = courseData.data;

        // Set course title
        courseTitleElement.textContent = course.Title;
        
        // Clear loading placeholders
        descriptionContainer.innerHTML = '';
        lessonsList.innerHTML = '';
        
        // Render description
        renderRichText(course.Description, descriptionContainer);

        // Process lessons
        if (course.lessons && course.lessons.length > 0) {
            // Update lesson counter
            lessonCounter.textContent = `${course.lessons.length} ${course.lessons.length === 1 ? 'Lesson' : 'Lessons'}`;
            
            // Set start course button link to first lesson
            startCourseBtn.onclick = () => {
                window.location.href = `lesson-viewer.html?id=${course.lessons[0].documentId}`;
            };
            
            // Render lessons
            course.lessons.forEach((lesson, index) => {
                const lessonItem = document.createElement('li');
                lessonItem.className = 'group transition-all duration-200 hover:bg-green-50 border-l-4 border-transparent hover:border-green-500';
                
                const lessonLink = document.createElement('a');
                lessonLink.href = `lesson-viewer.html?id=${lesson.documentId}`;
                lessonLink.className = 'flex items-center justify-between p-4';
                
                const leftContent = document.createElement('div');
                leftContent.className = 'flex items-center';
                
                const lessonNumber = document.createElement('span');
                lessonNumber.className = 'flex flex wrap items-center justify-center w-8 h-8 mr-4 rounded-full bg-gray-100 text-gray-700 font-semibold group-hover:bg-green-100 group-hover:text-green-700 transition-colors duration-200';
                lessonNumber.textContent = (index + 1).toString().padStart(2, '0');
                
                const lessonTitle = document.createElement('span');
                lessonTitle.className = 'font-medium text-gray-800 group-hover:text-green-700 transition-colors duration-200';
                lessonTitle.textContent = lesson.Title;
                
                leftContent.appendChild(lessonNumber);
                leftContent.appendChild(lessonTitle);
                
                const rightIcon = document.createElement('span');
                rightIcon.className = 'text-gray-400 group-hover:text-green-500 transition-colors duration-200';
                rightIcon.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>';
                
                lessonLink.appendChild(leftContent);
                lessonLink.appendChild(rightIcon);
                lessonItem.appendChild(lessonLink);
                lessonsList.appendChild(lessonItem);
            });
        } else {
            lessonCounter.textContent = "No Lessons";
            lessonsList.innerHTML = '<li class="p-8 text-center text-gray-500 italic">No lessons available for this course yet.</li>';
            startCourseBtn.disabled = true;
            startCourseBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

    } catch (error) {
        console.error('Error fetching course detail:', error);
        descriptionContainer.innerHTML = '<p class="text-red-500 font-medium">Failed to load course details. Please try again later.</p>';
        lessonCounter.textContent = "Error";
    }
});

// Function to load HTML components
async function loadComponent(path, containerId) {
    try {
        const response = await fetch(path);
        const text = await response.text();
        document.getElementById(containerId).innerHTML = text;
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
}

// Function to render rich text description
function renderRichText(richTextArray, container) {
    if (!richTextArray || richTextArray.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No description available.</p>';
        return;
    }

    richTextArray.forEach(block => {
        if (block.type === 'paragraph') {
            const pElement = document.createElement('p');
            pElement.className = 'mb-4 text-gray-700';
            renderInlineText(block.children, pElement);
            container.appendChild(pElement);
        } else if (block.type.startsWith('heading')) {
            const level = parseInt(block.type.replace('heading', ''), 10) || 3;
            const headingElement = document.createElement(`h${level}`);
            const headingClasses = {
                1: 'text-2xl font-bold text-gray-900 mb-4',
                2: 'text-xl font-bold text-gray-800 mb-3',
                3: 'text-lg font-semibold text-gray-800 mb-3',
                4: 'text-base font-semibold text-gray-800 mb-2',
                5: 'text-sm font-semibold text-gray-800 mb-2',
                6: 'text-xs font-semibold text-gray-800 mb-2'
            };
            headingElement.className = headingClasses[level] || headingClasses[3];
            renderInlineText(block.children, headingElement);
            container.appendChild(headingElement);
        } else if (block.type === 'blockquote') {
            const blockquoteElement = document.createElement('blockquote');
            blockquoteElement.className = 'border-l-4 border-gray-500 pl-4 italic text-gray-600 mb-4';
            renderInlineText(block.children, blockquoteElement);
            container.appendChild(blockquoteElement);
        } else if (block.type === 'list') {
            const listElement = document.createElement(block.format === 'ordered' ? 'ol' : 'ul');
            listElement.className = block.format === 'ordered' 
                ? 'list-decimal list-inside mb-4 pl-4 text-gray-700' 
                : 'list-disc list-inside mb-4 pl-4 text-gray-700';
            
            block.children.forEach(listItem => {
                const listItemElement = document.createElement('li');
                listItemElement.className = 'mb-2';
                renderInlineText(listItem.children, listItemElement);
                listElement.appendChild(listItemElement);
            });
            container.appendChild(listElement);
        } else if (block.type === 'code') {
            const preElement = document.createElement('pre');
            preElement.className = 'bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4';
            
            const codeElement = document.createElement('code');
            codeElement.className = 'font-mono text-sm';
            codeElement.textContent = block.children.map(child => child.text).join('');
            
            preElement.appendChild(codeElement);
            container.appendChild(preElement);
        }
    });
}

function renderInlineText(childrenArray, parentElement) {
    if (!childrenArray) return;
    
    childrenArray.forEach(child => {
        if (child.type === 'text') {
            if (child.code) {
                const codeElement = document.createElement('code');
                codeElement.className = 'bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm';
                codeElement.textContent = child.text;
                parentElement.appendChild(codeElement);
            } else {
                let textNode = document.createTextNode(child.text);

                if (child.bold || child.italic || child.underline || child.strikethrough || child.subscript || child.superscript) {
                    let textSpan = document.createElement('span');
                    textSpan.textContent = child.text;

                    if (child.bold) textSpan.classList.add('font-bold');
                    if (child.italic) textSpan.classList.add('italic');
                    if (child.underline) textSpan.classList.add('underline');
                    if (child.strikethrough) textSpan.classList.add('line-through');
                    if (child.subscript) {
                        let sub = document.createElement('sub');
                        sub.textContent = child.text;
                        parentElement.appendChild(sub);
                        return;
                    }
                    if (child.superscript) {
                        let sup = document.createElement('sup');
                        sup.textContent = child.text;
                        parentElement.appendChild(sup);
                        return;
                    }

                    parentElement.appendChild(textSpan);
                } else {
                    parentElement.appendChild(textNode);
                }
            }
        } else if (child.type === 'link') {
            const linkElement = document.createElement('a');
            linkElement.href = child.url;
            linkElement.className = 'text-blue-600 hover:text-blue-800 underline';
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            renderInlineText(child.children, linkElement);
            parentElement.appendChild(linkElement);
        }
    });
}
