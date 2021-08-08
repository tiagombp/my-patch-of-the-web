const js = {

    params : {

        nof_letters : 10,
        l : 10, // side of square,
        ch : 8, // squares in each dimension of a letter
        sq : 40 // squares in each dimension of a drawing

    },

    phrases : [

        'hi there',
        'i am tiago',
        'i like...'

        // make it work with capital letters to, later

    ],

    sizings : {

        // will be set by .set()
        h : null,
        w : null,

        set : function() {

            this.h = window.innerHeight;
            this.w = window.innerWidth;

        }


    },

    utils : {

        nof_pixels : function(word) {

            console.log(word.length);

            let sum = 0;
            
            for (letter of word) {
                if (letter == " ") continue
                sum += js.data.letters[letter].length;
            }
            
            return sum 

        },

        shuffle : function(array) {

            // #### Not my original code ####
            // taken from : https://bost.ocks.org/mike/shuffle/
            // just changed a 'var' for a 'let'

            let m = array.length, t, i;
          
            // While there remain elements to shuffle…
            while (m) {
          
              // Pick a remaining element…
              i = Math.floor(Math.random() * m--);
          
              // And swap it with the current element.
              t = array[m];
              array[m] = array[i];
              array[i] = t;
            }
          
            return array;

        },

        set_ids : function() {

            let rects = document.querySelectorAll('div.rect');

            console.log('vamos iterar');
            
            rects.forEach(div => {

                let id = js.data.indexes.pop()

                div.dataset.id = String(id);

                console.log(id);

            })

            console.log('fim');


        }

    },

    interactions : {

        theme : {

            ref : '.theme-selector select',

            container_ref : '.container',

            monitor_change : () => {

                const sel = document.querySelector(js.interactions.theme.ref);

                sel.addEventListener('change', js.interactions.theme.update);

            },

            update : (e) => {

                console.log(e.target.value);

                const ref = js.interactions.theme.container_ref;
                const option = e.target.value;

                document.querySelector(ref).dataset.theme = option;

            }

        }
    },

    treemap : {

        prepare : function() {

            console.log('Prepare');

            const data = {
                
                children : js.data.random

            };

            console.log(data);

            const w = js.sizings.w;
            const h = js.sizings.h;

            js.data.root = d3.treemap()
              .tile(d3.treemapBinary)
              .size([w, h])
              .round(true)
              (d3.hierarchy(data).sum(d => d))

        },

        draw : function() {

            const root = js.data.root;

            const svg = d3.select(".container");

            const leaf = svg.selectAll("div.rect")
                .data(root.leaves())
                .join("div")
                .classed('rect', true)
                .style("transform", d => `translate(${d.x0}px,${d.y0}px)`)
                .attr('data-color', (d,i) => `color${(i % 5) + 1}`)
                .style("width", d => (d.x1 - d.x0) + 'px')
                .style("height", d => (d.y1 - d.y0) + 'px');

        }

    },

    steps : {

        compute_position: function(step) {

            const ch = js.params.ch; 
            const sq = js.params.sq; // nof squares in each letter side -- 8
            const l  = js.params.l;

            const last_index = ch * ch;
    

            const st = js.steps[step];

            p1 = st.phrase1;
            p2 = st.phrase2;
            dr = st.drawing;

            // overall width and height

            let height = 0;

            height += p1 ? ch * l : 0;
            height += p2 ? ch * l + l : 0;
            height += dr ? sq * l + l : 0;


            let width = 0;

            width += p1 ? p1.length * ch * l : 0;
            width = p2 ? Math.max(p1.length, p2.length) * ch * l : width;
            width = dr ? Math.max(sq * l, width) : width;

            let w_screen = js.sizings.w;
            let h_screen = js.sizings.h;

            // initial positions in pixels

            const x0 = (w_screen - width)  / 2;
            const y0 = (h_screen - height) / 2;

            // borda

            d3.select('div.borda').remove();

            const cont = d3.select('.container')
              .append('div')
              .classed('borda', true)
              .style('position', 'absolute')
              .style('top', y0 + 'px')
              .style('left', x0 + 'px')
              .style('width', width + 'px')
              .style('height', height + 'px')
              .style('background-color', 'transparent')
              .style('border', "3px solid black");

            // initialize positions

            let positions = {
                
                'p1' : null,
                'p2' : null

            };

            let phrases = {

                'p1' : p1,
                'p2' : p2
            }

            let general_index = 0;

            // a function to evaluate the positions for a given reference

            function evaluate_positions_and_move(ref) {

                let phrase_positions = [];

                const p = phrases[ref];

                // initialize counter

                console.log(p);

                let n = 0;

                let y_desloc = ref == "p2" ? (l * (ch + 1) ) : 0;

                // for each letter of the phrase

                for (letter of p) {

                    console.log(letter);
    
                    if (letter != ' ') {
    
                        letter = letter.toLowerCase();
    
                        let this_letter_positions = js.data.letters[letter];

                        for (pos of this_letter_positions) {

                            let current_square = d3.select('[data-id="' + general_index + '"]');

                            let x = ( ( (pos % ch)) * l ) + (n * l * ch) + x0;
                            let y = ( Math.floor( pos / ch ) * l ) + y_desloc + y0;

                            //console.log(pos, x, y);
                            console.log(general_index, current_square.attr('data-id'));

                            current_square
                                .classed('active', true)
                                .transition()
                                .delay(1000)
                                .duration(200)
                                //.style('opacity', 1)
                                //.style('width', l + 'px')
                                //.style('height', l + 'px')
                                .style('transform', `translate(${x}px,${y}px)`);

                            general_index++;
                        }
    
                        //console.log(n, n*last_index, this_letter_positions);
        
                        // phrase_positions = phrase_positions.concat(this_letter_positions);

                        //console.log(phrase_positions);
    
                    }
    
                    n++;
    
                }

                positions[ref] = phrase_positions;

            }

            // now evalutate the positions for the phrases

            console.log(x0, y0, sq, l);

            if (p1) evaluate_positions_and_move('p1');
            if (p2) evaluate_positions_and_move('p2');

            // for (ref of ["p1", "p2"]) {
            // }

            console.log(positions);

            // save positions to current state

            js.ctrl.current_state.positions = positions;

            // hide the rest

            d3.selectAll('[data-id]')
              .classed('active', function(d) {
                  
                const id = +d3.select(this).attr('data-id')
                return !(id >= general_index);

              });

            // for (let id = general_index + 1; id <= js.data.random.length; id++) {

            //     let current_square = d3.select('[data-id="' + id + '"]');

            //     current_square
            //         .classed('active', false);

            // }

        },

        first : {

            phrase1 : 'hi',
            phrase2 : null,
            drawing : null,

            computed : {

                phrase1_positions: null,
                phrase2_positions: null,
                drawing_positions: null

            }

        },

        second : {

            phrase1 : 'I am Tiago',
            phrase2 : 'a drawing',
            drawing : null,

            computed : {

                phrase1_positions: null,
                phrase2_positions: null,
                drawing_positions: null

            }

        }


    },

    /*

    grid : {

        ref : '.grid-container',

        init : function() {

            //const cont = document.querySelector(this.ref);

            // for (let i = 1; i<=js.params.nof_letters; i++) {

            //     const new_div = document.createElement('div');

            //     new_div.classList.add('grid--letter');

            //     cont.appendChild(new_div);

            // }

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

                    const letter_positions = js.data.letters[letter.toLowerCase()];

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

                        if ( js.data.letters.hasOwnProperty(letter) ) {

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

            // gsap.to('[data-id]', {scale: 0,

            //     stagger: {
            //         from: "center",
            //         amount: 2
            //         }

            //  });

                //  .to('.grid--cell', {

                //     borderColor : "#efefef"

                //  })
                 .to('.phrase0', {

                    //rotationX: -90,
                    z: 0,
                    backgroundColor: "#333",
                    //scale: 0,
                    //opacity: 0,

                    stagger: {
                        grid: "auto",
                        from: "start",
                        each: 0.075
                        }

                 }, '+=.5')
                 .to('.phrase0', {

                    z : -1000,
                    backgroundColor: "transparent",
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

                    z: 0,
                    backgroundColor: "#333",
                    //scale: 0,
                    //opacity: 0,

                    stagger: {
                        grid: "auto",
                        from: "start",
                        each: 0.075
                        }

                 }, '+=.5')

            const anim2 = new gsap.timeline({paused: true})
            //  .to('.grid--cell', {

            //     borderColor : "#efefef"

            //  })
            .to('.phrase0', {

                //rotationX: -90,
                rotationY: 180,
                backgroundColor: "#333",
                //scale: 0,
                //opacity: 0,

                stagger: {
                    grid: "auto",
                    from: "start",
                    each: 0.075
                    }

            }, '+=.5')
            .to('.phrase0', {

                rotationY: 0,
                backgroundColor: "transparent",
                //rotationX: 0,
                //scale: 0,
                //opacity: 1,

                stagger: {
                    grid: "auto",
                    from: "end",
                    each: 0.02
                    }

            }, '+=2')

            .to('.phrase1', {

                rotationY: 180,
                backgroundColor: "#333",
                //scale: 0,
                //opacity: 0,

                stagger: {
                    grid: "auto",
                    from: "start",
                    each: 0.075
                    }

            }, '+=.5')
            
            anim2.play();


            


        }

    },

    */

    anims : {
        //let els = d3.selectAll('[data-color]').transition().duration(1000).delay((d,i)=>50+i*25).style('transform', 'translate(800px,0px) scale(0)')

        // duracao boa
        // let els = d3.selectAll('[data-color]').transition().duration(1000).delay((d,i)=>50+i*5).style('transform', 'translate(800px,0px) scale(0)')

        dissolve : function() {

            let els = d3.selectAll('[data-id]')
              .classed('pixel', true)
              //.style('transform', null) // css will take care now
              .style('width', null)
              .style('height', null);
              //.transition().duration(1000).delay((d,i)=>50+i*25).style('transform', 'translate(800px,0px) scale(0)')
    
    
        },

        prepare : function() {

            let els = d3.selectAll('[data-id]')
              .classed('pixel-start', false)
              .classed('pixel', true);


        }

    },


    data : {

        letters : null,

        indexes : [],

        random : [],

        load : function() {

            fetch('./prep/grid.json')
              .then(response => response.json())
              .then(data => js.ctrl.after_data(data));

        },

        create : function() {

            for (let i = 0; i < 800; i++) {

                js.data.random.push(Math.round(Math.random() * 100));

            }

        },

        make_indexes : function() {

            js.data.indexes = js.data.random.map((d,i) => i);

        }

    },

    ctrl : {

        current_state : {

            positions : null

        },

        init : function() {

            //js.grid.init();

            js.data.load();

            js.data.create();
            js.data.make_indexes();
            js.utils.shuffle(js.data.indexes);

            js.sizings.set();

            //js.ctrl.after_data();

        },

        after_data : function(data) {

            console.log('after data called')

            js.treemap.prepare();
            js.treemap.draw();

            js.data.letters = data;

            js.interactions.theme.monitor_change();

            console.log('Hi there');

            js.utils.set_ids();

            //js.grid.mark_cells();

        }
    }

}

js.ctrl.init();


