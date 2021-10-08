# Adaptation of Liground for Fairy-Stockfish

### Todo

- [X] Stop being lazy+scared and do something
- [ ] Explore the Chessgroundx 8.3.0 to the point I am comfortable with it
- [ ] Adapt Chessgroundx 8.3.0 for all the possible boards (12 to 1 both files and ranks)  
  - [ ] Option 1: Caveman code, insert all manually
  - [ ] Option 2: Besides the existing code on chessgroundx, add a potential calculator for board size and heights
  - [ ] Option 3: Generator of boards in the constructor
- [X] Merge the changes for the Chessgroundx 8.3.0 adaptation to the current code
- [ ] Figure out a better way of having Fairy-Stockfish only loading the local variants.ini file (Low priority) - and have the engine auto-load the variants
- [*] Reformulate the promotions to be based on legal moves available instead of the pre-programmed promotion tables (this will work nicely with Gating, and perhaps cause troubles to variants such as Kyoto)
- [ ] Have a piece "detector" everytime they're played, e.g. a variant with hidden pieces, the "detector" will add them to the database using the generic graphics, afterwards that piece will be available for customization (graphics)
- [ ] Piece Mapper and dynamic CSS for each variant - Once a new variant is added they will use the generic models (including xiangqi using chess pieces if that's the case, up to the user to gather the required piece)
- [ ] Consider whether or not the promoted piece svgs should be added to the pockets or not
- [ ] Dynamic pocket handler

### Afterwards - variants.ini Workshop
- [ ] Have all the available options from the variants.ini file (Possibly think of a way to dynamically get Fairy's options based on ffish.js or pyffish modifications)
- [ ] Size Validator (a simple operation Rank * File < 128) 
- [ ] Check for mutually exclusive options
- [ ] Graphical Board picker (Shogi, Xiangqi, Janggi, Chess, Makruk)
- [ ] Board Tester (Perform a check variants.ini operation before the test)
- [ ] Piece Tester (Create a temp variants.ini file with just the piece on the board, and abuse ffish.js to generate it)
- [ ] Betza reader to Graphics using arrows (Very hard)
- [ ] Betza editor for each custom piece added, the betza editor's idea is to purely add movement based on arrows and pointers from chessground (Very hard and will be looked at the end)
- [ ] Common options for variants 

### Ambitious Plans
- [ ] Ability to have a match against the computer (with premoves disabled)

### Graphics
- [X] Get SVGs for the whole alphabet in order to have generic pieces available (Merida only for now as generic)
- [X] Get SVGs for the promoted pieces (whole alphabet)
- [ ] Dig deeper into VUE's graphical abilities

### Technical
- [ ] Possible way to have ffish.js dynamically loaded instead of using the default one (in case of code testing)
- [ ] Look at ffish.js code and try to add PGN Support
- [ ] Definitely work on pyffish' Board support
- [ ] Look into the xboard display (e.g. xboard -> variant shogun displays all the details, pieces) Possibly implement that into ffish.js and pyffish

### Annoyances
- [ ] Figure out why variants with '-' do not work properly

