import { getCourses } from '../api/api-call.js'; // Adjust the path as necessary

document.addEventListener('DOMContentLoaded', async () => {
    const coursesContainer = document.getElementById('courses-container');

    try {
        const coursesData = await getCourses();
        const courses = coursesData.data;

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'cursor-pointer border border-gray-200 w-auto lg:w-96 rounded-lg overflow-hidden hover:shadow-2xl hover:bg-gray-50 transition-all duration-300';
            
            // Card header with category badge
            const cardHeader = document.createElement('div');
            cardHeader.className = 'relative';
            
            // Thumbnail Image
            if (course.Thumbnail) {
                const thumbnailElement = document.createElement('img');
                thumbnailElement.src = course.Thumbnail.formats?.thumbnail?.url ? `http://localhost:1337${course.Thumbnail.formats.thumbnail.url}` : `http://localhost:1337${course.Thumbnail.url}`;
                thumbnailElement.alt = course.Title;
                thumbnailElement.className = 'w-full h-48 object-cover';
                cardHeader.appendChild(thumbnailElement);
                
                // Add overlay gradient to image
                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent';
                cardHeader.appendChild(overlay);
            }
            
            // Category badge (assuming course has a category property, otherwise use a default)
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full';
            categoryBadge.innerHTML = `<i class="fas fa-tag mr-1"></i> ${course.Category || 'Course'}`;
            cardHeader.appendChild(categoryBadge);
            
            courseCard.appendChild(cardHeader);

            const cardBody = document.createElement('div');
            cardBody.className = 'p-5';

            // Title with bookmark icon
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'flex justify-between items-start mb-3';
            
            const titleElement = document.createElement('h2');
            titleElement.className = 'text-xl font-bold text-gray-800 hover:text-green-600 transition-colors duration-200 flex-1';
            titleElement.textContent = course.Title;
            
            const bookmarkIcon = document.createElement('button');
            bookmarkIcon.className = 'text-gray-400 hover:text-yellow-500 transition-colors duration-200 ml-2';
            bookmarkIcon.innerHTML = '<i class="far fa-bookmark"></i>';
            bookmarkIcon.setAttribute('aria-label', 'Bookmark course');
            
            titleWrapper.appendChild(titleElement);
            titleWrapper.appendChild(bookmarkIcon);
            cardBody.appendChild(titleWrapper);

            // Description with icon
            const descriptionWrapper = document.createElement('div');
            descriptionWrapper.className = 'flex space-x-3 mb-4';
            
            const descriptionIcon = document.createElement('div');
            descriptionIcon.className = 'text-green-500 mt-1';
            descriptionIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
            
            const descriptionSnippet = document.createElement('p');
            descriptionSnippet.className = 'text-gray-600  h- 2 0 text-sm leading-relaxed';
            
            if (course.Description && course.Description.length > 0 && course.Description[0].children && course.Description[0].children.length > 0) {
                descriptionSnippet.textContent = course.Description[0].children[0].text.substring(0, 200) + '...';
            } else {
                descriptionSnippet.textContent = 'No description available.';
            }
            
            descriptionWrapper.appendChild(descriptionIcon);
            descriptionWrapper.appendChild(descriptionSnippet);
            cardBody.appendChild(descriptionWrapper);

            // Course stats
            const statsContainer = document.createElement('div');
            statsContainer.className = 'flex justify-between items-center py-3 border-t border-b border-gray-100 my-4 text-xs text-gray-500';
            
            // Duration stat
            // const durationStat = document.createElement('div');
            // durationStat.className = 'flex items-center';
            // durationStat.innerHTML = '<i class="far fa-clock mr-1"></i> ' + (course.Duration || '8 hours');
            
            // Difficulty stat
            const difficultyStat = document.createElement('div');
            difficultyStat.className = 'flex items-center';
            difficultyStat.innerHTML = '<i class="fas fa-signal mr-1"></i> ' + (course.Difficulty || 'Intermediate');
            
            // Rating stat
            const ratingStat = document.createElement('div');
            ratingStat.className = 'flex items-center text-yellow-500';
            ratingStat.innerHTML = '<i class="fas fa-star mr-1"></i> ' + (course.Rating || '4.8');
            
            // statsContainer.appendChild(durationStat);
            statsContainer.appendChild(difficultyStat);
            statsContainer.appendChild(ratingStat);
            
            cardBody.appendChild(statsContainer);

            // CTA button with icon
            const link = document.createElement('a');
            link.href = `course-detail.html?id=${course.documentId}`;
            link.className = 'inline-flex items-center mt-2 bg-yellow-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full justify-center';
            link.innerHTML = '<i class="fas fa-brain mr-2"></i> Feed your brain';
            
            cardBody.appendChild(link);

            courseCard.appendChild(cardBody);
            coursesContainer.appendChild(courseCard);
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        coursesContainer.innerHTML = '<p class="text-red-500 flex items-center justify-center"><i class="fas fa-exclamation-circle mr-2"></i> Failed to load courses.</p>';
    }
    
    // Add Font Awesome for icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesome);
});