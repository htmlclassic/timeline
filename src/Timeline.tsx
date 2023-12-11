import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import './Timeline.scss';
import type { DataType } from "./data";

interface Props {
  data: DataType;
}

export default function Timeline({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef<SwiperRef>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const firstYearRef = useRef<HTMLSpanElement | null>(null);
  const lastYearRef = useRef<HTMLSpanElement | null>(null);
  const categoryRef = useRef<HTMLSpanElement | null>(null);
  const swiperContainerRef = useRef<HTMLDivElement | null>(null);

  const renderCount = useRef(0);

  const degBetween = 360 / data.length;
  const DURATION = 0.6;

  const dotsDegrees = getDotsDegrees(activeIndex, data.length);

  // set initial css
  useLayoutEffect(() => {
    const dots = circleRef.current!.querySelectorAll('.dot-container');
    const categoryNodes = circleRef.current?.querySelectorAll('.dot-container__category')!;
    
    gsap.to('.dot-container', {
      xPercent: 50,
      yPercent: -50,
      duration: 0,
    });

    for (let i = 1; i < dots.length; i++) {
      gsap.to(dots[i], {
        rotation: `-=${degBetween * i}`,
        duration: 0,
      });
    }

    // set first-year and last-year initial values
    firstYearRef.current!.textContent = data[activeIndex].startYear + '';
    lastYearRef.current!.textContent = data[activeIndex].endYear + '';

    gsap.to(categoryNodes[activeIndex], {
      opacity: 1,
      visibility: 'visible',
      duration: 0
    });

    return () => {
      for (let i = 1; i < dots.length; i++) {
        gsap.to(dots[i], {
          rotation: `+=${degBetween * i}`,
          duration: 0,
        });
      }
    };
  }, []);

  // animate first and last year change
  useEffect(() => {
    const firstYear = data[activeIndex].startYear;
    const lastYear = data[activeIndex].endYear;

    if (firstYearRef.current?.textContent !== firstYear.toString()) {
      counterAnimation(firstYearRef.current!, firstYear);
    }

    if (lastYearRef.current?.textContent !== lastYear.toString()) {
      counterAnimation(lastYearRef.current!, lastYear);
    }
  }, [activeIndex, data]);

  useEffect(() => {
    swiperRef.current?.swiper.slideTo(0, 0);

    // there will be fade in animations on first render in dev mode
    // remove React.StrictMode or run project in production mode to see correct results
    if (renderCount.current === 0) {
      renderCount.current++;
      return;
    }

    const tween = gsap.fromTo(swiperContainerRef.current,
      {
        opacity: 0,
        yPercent: '-20'
      },
      {
        delay: DURATION,
        opacity: 1,
        yPercent: 0
      }
    )

    const categoryNodes = circleRef.current?.querySelectorAll('.dot-container__category')!;

    const tl = gsap.timeline();

    tl.to(categoryNodes, {
      opacity: 0,
      duration: DURATION
    });
    tl.to(categoryNodes, {
      visibility: 'hidden',
    });

    gsap.to(categoryNodes[activeIndex], {
      visibility: 'visible',
      opacity: 1,
      delay: DURATION,
      duration: DURATION
    });

    return () => {
      tween.kill();
    };
  }, [activeIndex]);

  return (
    <div className="container">
      <div className="title">
        <div className="title__text">Исторические даты</div>
      </div>
      <div className="interval">
        <span ref={firstYearRef} className="interval__first-year"></span>
        <span ref={lastYearRef} className="interval__last-year"></span>
      </div>
      <div ref={circleRef} className="circle">
        {
          data.map((el, i) => {
            const isActive = i === activeIndex;

            return (
              <div
                key={i}
                className="line"
                style={{ transform: `translateY(-50%) rotate(${i * degBetween}deg)` }}
              >
                <div className="dot-container">
                  <span ref={categoryRef} className="dot-container__category">{el.category}</span>
                  <div
                    className={`dot ${isActive ? 'dot_active' : ''}`}
                    onClick={() => setActiveDot(i)}
                  >
                    <span className="dot__number">{ i + 1 }</span>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      <div className="container-inner">
        <div className="interval-selector">
          <span>0{activeIndex+1}/0{data.length}</span>
          <div className="interval-selector__buttons">
            <button 
              className={`button ${activeIndex === 0 ? 'button_disabled' : ''}`}
              disabled={activeIndex === 0}
              onClick={showPrev}
            >
              <ArrowIcon />
            </button>
            <button 
              className={`button button_inversed ${
                activeIndex === data.length-1 ? 'button_disabled' : ''
              }`}
              disabled={activeIndex === data.length-1}
              onClick={showNext}
            >
              <ArrowIcon />
            </button>
          </div>
          <div className="mobile-interval-nav">
            {
              data.map((el, i) =>
                <div 
                  onClick={() => setActiveDot(i)}
                  className="mobile-interval-nav__dot-wrapper"
                  key={i}
                >
                  <button
                    className={`mobile-interval-nav__dot ${
                      activeIndex === i ? 'mobile-interval-nav__dot_active' : ''
                    }`}
                  >
                  </button>
                </div>
              )
            }
          </div>
        </div>
        <div ref={swiperContainerRef}>
          <div
            className="mobile_category"
          >
            { data[activeIndex].category }
          </div>
          <Swiper
            ref={swiperRef}
            navigation={{
              prevEl: '.swiper_navigation_button__prev',
              nextEl: '.swiper_navigation_button__next'
            }}
            slidesPerView={3}
            spaceBetween={80}
            modules={[Navigation]}
            className="mySwiper"
          >
            <button className="button swiper_navigation_button swiper_navigation_button__prev">
              <ArrowIcon />
            </button>
            <button className="button swiper_navigation_button swiper_navigation_button__next">
              <ArrowIcon />
            </button>
            {
              data[activeIndex].events.map((event, i) =>
                <SwiperSlide key={i} className="event">
                  <div className="event__year">{ event.year }</div>
                  <div className="event__description">{ event.description }</div>
                </SwiperSlide>
              )
            }
          </Swiper>
        </div>
      </div>
      
    </div>
  );

  function rotateCircle(clockwiseDirection: boolean, rotateValue: number) {
    const dotContainers = circleRef.current!.querySelectorAll('.dot-container');

    if (clockwiseDirection) {
      gsap.to(circleRef.current, {
        rotation: `+=${rotateValue}`,
        duration: DURATION
      });
  
      gsap.to(dotContainers, {
        rotation: `-=${rotateValue}`,
        duration: DURATION
      });
    } else {
      gsap.to(circleRef.current, {
        rotation: `-=${rotateValue}`,
        duration: DURATION
      });
  
      gsap.to(dotContainers, {
        rotation: `+=${rotateValue}`,
        duration: DURATION
      });


    }
  }

  function counterAnimation(element: HTMLElement, newValue: number) {
    gsap.to(element, {
      innerText: newValue,
      duration: DURATION,
      ease: 'ease-out',
      snap: {
        innerText: 1
      }
    });
  }

  function setActiveDot(index: number) {
    if (index === activeIndex) return;

    const dot = dotsDegrees.find(item => item.index === index)!;

    const clockwiseDirection = dot.deg > 180;
    let rotateValue = dot.deg;

    if (clockwiseDirection) rotateValue = 360 - dot.deg;
    
    if (clockwiseDirection) {
      rotateCircle(true, rotateValue);
    } else {
      rotateCircle(false, rotateValue);
    }

    setActiveIndex(index);
  };

  function showPrev() {
    setActiveDot(activeIndex - 1);
  };

  function showNext() {
    setActiveDot(activeIndex + 1);
  };
}

function getDotsDegrees(activeDotIndex: number, dotsCount: number) {
  const dots: number[] = [];
  const degBetween = 360 / dotsCount;

  for (let i = 0; i < dotsCount; i++) {
    dots.push(i);
  }

  const newArr = dots.slice(activeDotIndex, dotsCount).concat(dots.slice(0, activeDotIndex));

  return newArr.map((el, i) => ({
    index: el,
    deg: i * degBetween
  }));
}

function ArrowIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.49988 0.750001L2.24988 7L8.49988 13.25" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}