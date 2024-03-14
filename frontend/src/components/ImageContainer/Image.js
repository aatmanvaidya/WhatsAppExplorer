import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function Image(props) {
    const src = props.src
    const title = props.title
    return (
        <Card sx={{ width: 345, marginLeft: 'auto', marginRight: 'auto' }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="140"
                    image={src}
                    alt="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Lizards are a widespread group of squamate reptiles, with over 6,000
                        species, ranging across all continents except Antarctica
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary">
                    Details
                </Button>
                <Button size="small" color="primary">
                    Evaluate
                </Button>
            </CardActions>
        </Card>
    );
}