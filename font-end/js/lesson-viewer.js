import { getLessonDetail } from '../api/api-call.js'; // Adjust the import path as necessary

document.addEventListener('DOMContentLoaded', async () => {
    const lessonTitleElement = document.getElementById('viewer-title');
    const lessonContentContainer = document.getElementById('lesson-content');
    const durationTime = document.getElementById('duration');


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
        durationTime.textContent = lesson.Duration ? `${lesson.Duration} minutes` : 'Duration not available';

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

// Re-use renderRichText and renderInlineText functions  
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
