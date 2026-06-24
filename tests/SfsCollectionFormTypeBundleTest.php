<?php

namespace Softspring\Component\CollectionFormType\Tests;

use PHPUnit\Framework\TestCase;
use Softspring\Component\CollectionFormType\SfsCollectionFormTypeBundle;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class SfsCollectionFormTypeBundleTest extends TestCase
{
    public function testItIsASymfonyBundle(): void
    {
        self::assertInstanceOf(Bundle::class, new SfsCollectionFormTypeBundle());
    }
}
