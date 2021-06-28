const js = {

    params : {

        nof_letters : 10

    },

    phrases : [

        'hi there',
        'i am tiago'
        // make it work with capital letters to, later

    ],

    grid : {

        ref : '.grid-container',

        init : function() {

            const cont = document.querySelector(this.ref);

            for (let i = 1; i<=js.params.nof_letters; i++) {

                const new_div = document.createElement('div');

                new_div.classList.add('grid--letter');

                cont.appendChild(new_div);

            }

        },

        mark_cells : function() {

            const phrases = js.phrases;

            const div_letters = document.querySelectorAll('.grid--letter');

            console.log(phrases, div_letters);

            phrases.forEach( (phrase, i_phrase) => {

                const letters = phrase.split('');

                console.log('Letters: ', letters);

                letters.forEach((letter,i) => {

                    const first_cell = div_letters[i].querySelector('.grid--cell');

                    if (first_cell) div_letters[i].classList.add('has-cells');

                    //if (i > js.params.nof_letters) continue;

                    const letter_positions = js.data.raw[letter.toLowerCase()];

                    for (let n = 0; n <= 63; n++) {

                        //console.log(letter, i, n);

                        let current_cell;

                        const was_empty_div_letter = !div_letters[i].classList.contains('has-cells');

                        if (!was_empty_div_letter) {

                            current_cell = div_letters[i].querySelector('[data-cell-no="' + n + '"]');

                        } else {

                            current_cell = document.createElement('div');
                            current_cell.classList.add('grid--cell');
                            current_cell.dataset['cellNo'] = n;

                        }

                        if ( js.data.raw.hasOwnProperty(letter) ) {

                            if ( letter_positions.includes(n)) {

                                current_cell.classList.add('phrase' + i_phrase);

                            } 

                        }

                        if (was_empty_div_letter) {

                            div_letters[i].appendChild(current_cell);

                        }
                        
                        

                    }

                })

            })

            const anim = new gsap.timeline({paused: true})
                //  .to('.grid--cell', {

                //     borderColor : "#efefef"

                //  })
                 .to('.phrase0', {

                    //rotationX: -90,
                    z: -1000,
                    //scale: 0,
                    //opacity: 0,

                    stagger: {
                        grid: "auto",
                        from: "edges",
                        each: 0.075
                        }

                 }, '+=.5')
                 .to('.phrase0', {

                    z : 0,
                    //rotationX: 0,
                    //scale: 0,
                    //opacity: 1,

                    stagger: {
                        grid: "auto",
                        from: "edges",
                        each: 0.025
                        }

                 }, '+=3')

                 .to('.phrase1', {

                    rotationX: -90,
                    //scale: 0,
                    //opacity: 0,

                    stagger: {
                        grid: "auto",
                        from: "start",
                        each: 0.075
                        }

                 }, '+=.5')
            
            anim.play();


            


        }

    },


    data : {

        raw : null,

        load : function() {

            fetch('./prep/grid.json')
              .then(response => response.json())
              .then(data => js.ctrl.after_data(data));






        }

    },

    ctrl : {

        init : function() {

            js.grid.init();

            js.data.load();

        },

        after_data : function(data) {

            js.data.raw = data;

            console.log('Hi there');

            js.grid.mark_cells();

        }
    }

}

js.ctrl.init();


