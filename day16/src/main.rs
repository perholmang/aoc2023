use {
    std::fs,
    std::env,
    std::collections::HashSet,
    std::collections::HashMap,
    std::fmt
};

#[derive(PartialEq, Debug, Copy, Clone)]
enum Direction  {
    Up = 0,
    Down =1,
    Left = 2,
    Right = 3
}

impl fmt::Display for Direction {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Direction::Up => write!(f, "Up"),
            Direction::Down => write!(f, "Down"),
            Direction::Left => write!(f, "Left"),
            Direction::Right => write!(f, "Right"),
        }
    }
}
#[derive(Debug)]
struct Beam {
    x: usize,
    y: usize,
    direction: Direction
}

fn energize(input: &Vec<String>, start: (usize, usize, Direction)) -> usize{
    let mut beams: Vec<Beam> = vec![Beam { x: start.0, y: start.1, direction: start.2 }];
    let mut seen = HashSet::<(usize,usize)>::new();
    let mut visited: HashMap<(usize,usize,String), usize> = HashMap::new();

    while !beams.is_empty() {
        let beam = beams.pop().unwrap();

        let visitedLength = seen.len();
        let x = beam.x;
        let y = beam.y;

        if (x >= input[0].len() || y >= input.len()) {
            continue;
        }
        
        let direction = beam.direction;
        let cell = input[y].chars().nth(x).unwrap();

        let key = (x,y,direction.to_string());

        seen.insert((x,y));

        if visited.contains_key(&key) {
            continue;
        }

        visited.insert(key, 1);

        match (cell, direction) {
                ('.', Direction::Up) => if y > 0 { beams.push(Beam {x:x, y: y-1, direction: Direction::Up}) },
                ('.', Direction::Down) => if y < input.len() - 1 { beams.push(Beam {x:x, y: y+1, direction: Direction::Down}) },
                ('.', Direction::Left) => if x > 0 { beams.push(Beam {x:x-1, y: y, direction: Direction::Left}) },
                ('.', Direction::Right) => if x < input[y].len() - 1 { beams.push(Beam {x:x+1, y: y, direction: Direction::Right}) },
                ('|', Direction::Up) => if y > 0 { beams.push(Beam {x:x, y: y-1, direction: Direction::Up}) },
                ('|', Direction::Down) => if y < input.len() - 1 { beams.push(Beam {x:x, y: y+1, direction: Direction::Down}) },
                ('|', Direction::Left) => {if y > 0 { 
                    beams.push(Beam {x:x, y: y-1, direction: Direction::Up})
                }
                 if y < input.len() - 1 {
                    beams.push(Beam {x:x, y: y+1, direction: Direction::Down})
                 }
                },
                ('|', Direction::Right) => {if y > 0 { 
                    beams.push(Beam {x:x, y: y-1, direction: Direction::Up})
                }
                 if y < input.len() - 1 {
                    beams.push(Beam {x:x, y: y+1, direction: Direction::Down})
                 }
                },
                ('-', Direction::Left) => if x > 0 { beams.push(Beam {x:x-1, y: y, direction: Direction::Left}) },
                ('-', Direction::Right) => if x < input[y].len() - 1 { beams.push(Beam {x:x+1, y: y, direction: Direction::Right}) },
                ('-', Direction::Up) => {
                    if x > 0 {
                        beams.push(Beam {x:x-1, y: y, direction: Direction::Left})
                    }
                    if x < input[y].len() - 1 {
                        beams.push(Beam {x:x+1, y: y, direction: Direction::Right})
                    }
                },
                ('-', Direction::Down) => {
                    if x > 0 {
                        beams.push(Beam {x:x-1, y: y, direction: Direction::Left})
                    }
                    if x < input[y].len() - 1 {
                        beams.push(Beam {x:x+1, y: y, direction: Direction::Right})
                    }
                },
                ('/', Direction::Left) => if y < input.len() - 1 { beams.push(Beam {x:x, y: y+1, direction: Direction::Down}) },
                ('/', Direction::Right) => if y > 0 { beams.push(Beam {x:x, y: y-1, direction: Direction::Up}) },
                ('/', Direction::Up) => if x < input[y].len() - 1 { beams.push(Beam {x:x+1, y: y, direction: Direction::Right}) },
                ('/', Direction::Down) => if x > 0 { beams.push(Beam {x:x-1, y: y, direction: Direction::Left}) },
                ('\\', Direction::Left) => if y > 0 { beams.push(Beam {x:x, y: y-1, direction: Direction::Up}) },
                ('\\', Direction::Right) => if y < input.len() - 1 { beams.push(Beam {x:x, y: y+1, direction: Direction::Down}) },
                ('\\', Direction::Up) => if x > 0 { beams.push(Beam {x:x-1, y: y, direction: Direction::Left}) },
                ('\\', Direction::Down) => if x < input[y].len() - 1 { beams.push(Beam {x:x+1, y: y, direction: Direction::Right}) },

                _ => panic!("invalid direction or cell")
        }

    }

    return seen.len()
}

fn main() {
    let contents = fs::read_to_string("./input.txt").unwrap();

    let input: Vec<String> = contents.lines().map(|s| s.to_string()).collect();

    if env::var("part").unwrap() == "part1" {
        return println!("{}", energize(&input, (0,0, Direction::Right)));
    } 

    let mut max = 0;
    for y in 0..input.len() {
        let b = energize(&input, (0,y,Direction::Right));
        if b > max { max = b }
        let b = energize(&input, (input[0].len(),y,Direction::Left));
        if b > max { max = b }
    }

    for x in 0..input[0].len() {
        let b = energize(&input, (x,0,Direction::Down));
        if b > max { max = b }
        let b = energize(&input, (x,input.len(),Direction::Up));
        if b > max { max = b }
    }

    println!("{}", max);
}



