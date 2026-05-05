<?php

declare(strict_types=1);

namespace Softspring\Component\CollectionFormType\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;

final class SfsCollectionFormTypeExtension extends Extension implements PrependExtensionInterface
{
    public function load(array $configs, ContainerBuilder $container): void
    {
    }

    public function prepend(ContainerBuilder $container): void
    {
        $assetsDistPath = \dirname(__DIR__, 2).'/assets/dist';

        $container->prependExtensionConfig('framework', [
            'asset_mapper' => [
                'paths' => [
                    $assetsDistPath => '@softspring/collection-form-type',
                ],
            ],
        ]);
    }
}
