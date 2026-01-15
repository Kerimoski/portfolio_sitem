/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */


/**
 * Node modules
 */
import PropTypes from 'prop-types';


const ProjectCard = ({
  imgSrc,
  title,
  tags,
  projectLink,
  classes
}) => {
  return (
    <div className={"w-full h-full p-4 transition-all duration-300 " + classes}>
      <figure className="aspect-square rounded-lg mb-4 overflow-hidden bg-zinc-700">
        <img
          src={imgSrc}
          alt={title}
          loading='lazy'
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            console.error('Görüntü yükleme hatası:', e);
            e.target.src = '/images/placeholder.jpg';
          }}
        />
      </figure>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="title-1 mb-3 text-white">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((label, key) => (
              <span
                key={key}
                className="h-8 text-sm text-zinc-400 bg-zinc-700/50 grid items-center px-3 rounded-lg"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {projectLink && (
          <div className="w-11 h-11 rounded-lg grid place-items-center bg-sky-400 text-zinc-950 shrink-0">
            <span className="material-symbols-rounded" aria-hidden="true">
              arrow_outward
            </span>
          </div>
        )}
      </div>

      {projectLink && (
        <a
          href={projectLink}
          target='_blank'
          className="absolute inset-0"
          rel="noopener noreferrer"
        ></a>
      )}
    </div>
  );
};

ProjectCard.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
  projectLink: PropTypes.string,
  classes: PropTypes.string
};

export default ProjectCard;